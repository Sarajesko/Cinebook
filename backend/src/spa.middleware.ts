import { Injectable, NestMiddleware } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import type { NextFunction, Request, Response } from 'express';
import { shouldServeSpa } from './spa-routing';

@Injectable()
export class SpaMiddleware implements NestMiddleware {
  private readonly indexHtml = join(
    __dirname,
    '..',
    '..',
    'public',
    'index.html',
  );

  use(req: Request, res: Response, next: NextFunction) {
    const path = (req.originalUrl || req.url || '').split('?')[0];
    if (!shouldServeSpa(req.method, path)) {
      return next();
    }
    if (!existsSync(this.indexHtml)) {
      return next();
    }
    return res.sendFile(this.indexHtml);
  }
}
