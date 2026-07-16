import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Wishes (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let wishId: string;

  const handle = `wish_${Date.now()}`;
  const password = 'secreto1';
  const isbn = '9788491812345';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const reg = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ handle, password })
      .expect(201);
    token = reg.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects wishes without token', () => {
    return request(app.getHttpServer()).get('/api/wishes').expect(401);
  });

  it('creates a wish', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/wishes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Libro deseado',
        autores: 'Autor',
        isbn,
        lengua: 'fr',
        paisEdicion: 'Francia',
        prioridad: 'alta',
        notas: 'feria',
      })
      .expect(201);
    wishId = res.body.id;
    expect(res.body.titulo).toBe('Libro deseado');
  });

  it('lists wishes', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/wishes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.some((w: { id: string }) => w.id === wishId)).toBe(true);
  });

  it('detects wishMatch when creating a book with same ISBN', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Libro deseado',
        autores: 'Autor',
        anio: 2010,
        editorial: 'Gallimard',
        lengua: 'fr',
        paisEdicion: 'Francia',
        isbn,
        estado: 'recien_comprado',
        fechaCompra: '2026-07-10',
        condicion: 'segunda_mano',
        precio: 12,
        puntuacion: 7,
      })
      .expect(201);

    expect(res.body.wishMatch).toBeTruthy();
    expect(res.body.wishMatch.id).toBe(wishId);

    // cleanup book so to-collection can use another wish
    await request(app.getHttpServer())
      .delete(`/api/books/${res.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('to-collection creates book and closes wish', async () => {
    const wish = await request(app.getHttpServer())
      .post('/api/wishes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Otro deseado',
        autores: 'Bazin',
        isbn: '9781234509876',
        lengua: 'es',
        paisEdicion: 'España',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/api/wishes/${wish.body.id}/to-collection`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Otro deseado',
        autores: 'Bazin',
        anio: 1967,
        editorial: 'Paidós',
        lengua: 'es',
        paisEdicion: 'España',
        isbn: '9781234509876',
        estado: 'recien_comprado',
        fechaCompra: '2026-07-11',
        condicion: 'nuevo',
        precio: 22,
        puntuacion: 9,
      })
      .expect(201);

    expect(res.body.closedWishId).toBe(wish.body.id);
    expect(res.body.book.estado).toBe('recien_comprado');

    await request(app.getHttpServer())
      .get(`/api/wishes/${wish.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
