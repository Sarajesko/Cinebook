import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { join } from 'path';
import { SpaNotFoundFilter } from './spa-not-found.filter';

export function publicDir(): string {
  return join(__dirname, '..', '..', 'public');
}

export function configureApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const dir = publicDir();
  if (existsSync(join(dir, 'index.html'))) {
    app.useStaticAssets(dir, { index: false });
    app.useGlobalFilters(new SpaNotFoundFilter());
  }
}
