import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { SpaNotFoundFilter } from './spa-not-found.filter';

function corsOrigins(): boolean | string | string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === '*') {
    return true;
  }
  const list = raw.split(',').map((o) => o.trim()).filter(Boolean);
  return list.length <= 1 ? (list[0] ?? true) : list;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: corsOrigins(),
    credentials: true,
  });

  const publicDir = join(__dirname, '..', '..', 'public');
  if (existsSync(join(publicDir, 'index.html'))) {
    app.useStaticAssets(publicDir, { index: false });
    app.useGlobalFilters(new SpaNotFoundFilter());
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Cinebook API listening on http://localhost:${port}/api`);
}
bootstrap();
