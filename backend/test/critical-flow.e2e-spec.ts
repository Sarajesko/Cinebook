import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

/**
 * Flujo crítico v1: login → alta libro → anti-duplicado → búsqueda en listado
 * (+ wishlist → colección).
 */
describe('Critical flow (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  const handle = `crit_${Date.now()}`;
  const password = 'secreto1';
  const isbn = '9780306406157';

  const bookPayload = {
    titulo: 'Hitchcock / Truffaut',
    autores: 'François Truffaut',
    anio: 1983,
    editorial: 'Alianza',
    lengua: 'es',
    paisEdicion: 'España',
    isbn,
    estado: 'recien_comprado',
    fechaCompra: '2026-07-16',
    condicion: 'segunda_mano',
    precio: 12.5,
    puntuacion: 9,
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

  it('registers, logs in, creates wish, creates book, detects duplicate, searches list, closes wish via to-collection path data', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ handle, password })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ handle, password })
      .expect(201);
    token = login.body.accessToken;
    expect(token).toBeTruthy();

    const wish = await request(app.getHttpServer())
      .post('/api/wishes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: bookPayload.titulo,
        autores: bookPayload.autores,
        isbn,
        lengua: 'es',
        prioridad: 'alta',
      })
      .expect(201);

    const created = await request(app.getHttpServer())
      .post('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .send(bookPayload)
      .expect(201);

    expect(created.body.id).toBeDefined();
    expect(created.body.wishMatch?.id).toBe(wish.body.id);
    expect(created.body.bandera).toBe('ES');

    const dup = await request(app.getHttpServer())
      .post('/api/books/check-duplicate')
      .set('Authorization', `Bearer ${token}`)
      .send({ isbn })
      .expect(201);
    expect(dup.body.duplicate).toBe(true);
    expect(dup.body.matchBy).toBe('isbn');

    const list = await request(app.getHttpServer())
      .get('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const q = 'hitchcock';
    const found = (list.body as Array<{ titulo: string; isbn: string; directores: string[] }>).filter(
      (b) =>
        b.titulo.toLowerCase().includes(q) ||
        b.isbn.includes(isbn) ||
        (b.directores ?? []).some((d) => d.toLowerCase().includes(q)),
    );
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found.some((b) => b.isbn === isbn)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/wishes/${wish.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const stats = await request(app.getHttpServer())
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(stats.body.totalLibros).toBeGreaterThanOrEqual(1);
  });
});
