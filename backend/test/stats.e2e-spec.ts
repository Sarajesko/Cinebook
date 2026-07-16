import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Stats (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  const handle = `stats_${Date.now()}`;
  const password = 'secreto1';

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

    await request(app.getHttpServer())
      .post('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Stats Book',
        autores: 'Author',
        anio: 1975,
        editorial: 'Cahiers',
        lengua: 'fr',
        paisEdicion: 'Francia',
        isbn: '9785555555555',
        estado: 'leido',
        fechaCompra: '2026-03-01',
        condicion: 'nuevo',
        precio: 15.5,
        puntuacion: 7,
        directores: ['Godard'],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/wishes')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Wish abierto' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects stats without token', () => {
    return request(app.getHttpServer()).get('/api/stats').expect(401);
  });

  it('returns overview stats', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.totalLibros).toBeGreaterThanOrEqual(1);
    expect(res.body.gasto.total).toBeGreaterThan(0);
    expect(res.body.byLengua.some((r: { key: string }) => r.key === 'fr')).toBe(
      true,
    );
    expect(res.body.wishlist.abiertos).toBeGreaterThanOrEqual(1);
    expect(res.body.puntuaciones.distribution).toBeDefined();
  });
});
