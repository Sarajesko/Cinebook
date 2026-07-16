import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Books + Auth (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let bookId: string;

  const handle = `user_${Date.now()}`;
  const password = 'secreto1';

  const bookPayload = {
    titulo: 'El cine según Hitchcock',
    autores: 'François Truffaut',
    anio: 1983,
    editorial: 'Alianza',
    lengua: 'es',
    paisEdicion: 'España',
    isbn: '9788420674237',
    estado: 'por_leer',
    fechaCompra: '2026-07-01',
    condicion: 'nuevo',
    precio: 18.9,
    puntuacion: 8,
    caratula: 'https://example.com/cover.jpg',
    directores: ['Alfred Hitchcock'],
  };

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects books without token', () => {
    return request(app.getHttpServer()).get('/api/books').expect(401);
  });

  it('registers and returns JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ handle, password })
      .expect(201);
    token = res.body.accessToken;
    expect(token).toBeDefined();
  });

  it('creates a book with condition price rating', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .send(bookPayload)
      .expect(201);

    bookId = res.body.id;
    expect(res.body.bandera).toBe('ES');
    expect(res.body.condicion).toBe('nuevo');
    expect(res.body.precio).toBe(18.9);
    expect(res.body.puntuacion).toBe(8);
    expect(res.body.directores).toContain('Alfred Hitchcock');
  });

  it('check-duplicate finds ISBN match', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/books/check-duplicate')
      .set('Authorization', `Bearer ${token}`)
      .send({ isbn: '9788420674237' })
      .expect(201);
    expect(res.body.duplicate).toBe(true);
    expect(res.body.matchBy).toBe('isbn');
  });

  it('check-duplicate finds titulo+autor+editorial', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/books/check-duplicate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'El cine según Hitchcock',
        autores: 'François Truffaut',
        editorial: 'Alianza',
      })
      .expect(201);
    expect(res.body.duplicate).toBe(true);
    expect(res.body.matchBy).toBe('titulo_autor_editorial');
  });

  it('check-duplicate no match', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/books/check-duplicate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        isbn: '1111111111111',
        titulo: 'Otro libro',
        autores: 'Nadie',
        editorial: 'X',
      })
      .expect(201);
    expect(res.body.duplicate).toBe(false);
  });

  it('lists books for the user', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.some((b: { id: string }) => b.id === bookId)).toBe(true);
  });

  it('updates a book', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'leyendo', puntuacion: 9, condicion: 'segunda_mano' })
      .expect(200);
    expect(res.body.estado).toBe('leyendo');
    expect(res.body.puntuacion).toBe(9);
    expect(res.body.condicion).toBe('segunda_mano');
  });

  it('deletes a book', async () => {
    await request(app.getHttpServer())
      .delete(`/api/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
