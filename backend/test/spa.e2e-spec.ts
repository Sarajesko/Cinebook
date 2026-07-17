import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp, publicDir } from '../src/configure-app';

/**
 * Replica el fallo de producción: GET /catalogo/:id no debe devolver
 * {"statusCode":500,"message":"Internal server error"} sino el HTML del SPA.
 */
describe('SPA deep links (e2e)', () => {
  let app: NestExpressApplication;
  const dir = publicDir();
  const indexPath = join(dir, 'index.html');
  const marker = '<!-- cinebook-spa-e2e-fixture -->';
  let createdFixture = false;

  beforeAll(async () => {
    if (!existsSync(indexPath)) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        indexPath,
        `<!doctype html><html><head><title>Cinebook</title></head><body>${marker}<app-root></app-root></body></html>\n`,
        'utf8',
      );
      createdFixture = true;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (createdFixture) {
      try {
        rmSync(indexPath, { force: true });
      } catch {
        /* ignore */
      }
    }
  });

  it('GET /catalogo/:id → HTML del front (no JSON Nest)', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/catalogo/cmrp5oqsm000101lgk81pgu99')
      .expect(200);

    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toMatch(/<html|app-root|Cinebook/i);
    expect(res.text).not.toMatch(/"statusCode"\s*:\s*500/);
    expect(res.text).not.toMatch(/Internal server error/);
  });

  it('GET /login → HTML', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/login')
      .expect(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('GET /api sigue siendo la API (no el SPA)', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/api')
      .expect(200);
    expect(res.text).toBe('Cinebook API — Cinema Library');
  });
});
