import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

/**
 * Aislamiento entre usuarios: B no puede leer/editar/borrar recursos de A.
 * Regresión de IDOR (el gap de cobertura más alto del audit).
 */
describe('Ownership / IDOR (e2e)', () => {
  let app: INestApplication<App>;
  let tokenA: string;
  let tokenB: string;
  let bookIdA: string;
  let wishIdA: string;

  const stamp = Date.now();
  const password = 'secreto1';

  const bookPayload = {
    titulo: 'Libro solo de A',
    autores: 'Autor A',
    anio: 2001,
    editorial: 'Ed A',
    lengua: 'es',
    paisEdicion: 'España',
    isbn: `978${String(stamp).slice(-10)}`,
    estado: 'por_leer',
    fechaCompra: '2026-07-01',
    condicion: 'nuevo',
    precio: 10,
    puntuacion: 5,
  };

  const toCollectionPayload = {
    titulo: 'Wish de A',
    autores: 'Autor Wish',
    anio: 1999,
    editorial: 'Ed Wish',
    lengua: 'es',
    paisEdicion: 'España',
    isbn: `979${String(stamp).slice(-10)}`,
    estado: 'recien_comprado',
    fechaCompra: '2026-07-12',
    condicion: 'nuevo',
    precio: 15,
    puntuacion: 6,
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

    const regA = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ handle: `idor_a_${stamp}`, password })
      .expect(201);
    tokenA = regA.body.accessToken;

    const regB = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ handle: `idor_b_${stamp}`, password })
      .expect(201);
    tokenB = regB.body.accessToken;

    const book = await request(app.getHttpServer())
      .post('/api/books')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(bookPayload)
      .expect(201);
    bookIdA = book.body.id;

    const wish = await request(app.getHttpServer())
      .post('/api/wishes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        titulo: 'Wish de A',
        autores: 'Autor Wish',
        isbn: toCollectionPayload.isbn,
        lengua: 'es',
        paisEdicion: 'España',
        prioridad: 'alta',
      })
      .expect(201);
    wishIdA = wish.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('B no ve el libro de A en el listado', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/books')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    expect(res.body.some((b: { id: string }) => b.id === bookIdA)).toBe(false);
  });

  it('B no puede GET el libro de A', async () => {
    await request(app.getHttpServer())
      .get(`/api/books/${bookIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('B no puede PATCH el libro de A', async () => {
    await request(app.getHttpServer())
      .patch(`/api/books/${bookIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ estado: 'leyendo' })
      .expect(404);
  });

  it('B no puede DELETE el libro de A', async () => {
    await request(app.getHttpServer())
      .delete(`/api/books/${bookIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('B no ve el wish de A en el listado', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/wishes')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    expect(res.body.some((w: { id: string }) => w.id === wishIdA)).toBe(false);
  });

  it('B no puede GET el wish de A', async () => {
    await request(app.getHttpServer())
      .get(`/api/wishes/${wishIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('B no puede PATCH el wish de A', async () => {
    await request(app.getHttpServer())
      .patch(`/api/wishes/${wishIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ prioridad: 'baja' })
      .expect(404);
  });

  it('B no puede DELETE el wish de A', async () => {
    await request(app.getHttpServer())
      .delete(`/api/wishes/${wishIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('B no puede to-collection del wish de A', async () => {
    await request(app.getHttpServer())
      .post(`/api/wishes/${wishIdA}/to-collection`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send(toCollectionPayload)
      .expect(404);
  });

  it('A sigue teniendo su libro y wish tras los intentos de B', async () => {
    await request(app.getHttpServer())
      .get(`/api/books/${bookIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/wishes/${wishIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
  });
});
