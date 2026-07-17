import { Injectable, NestMiddleware } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import type { NextFunction, Request, Response } from 'express';

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
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const path = (req.originalUrl || req.url || '').split('?')[0];
    if (path.startsWith('/api')) {
      return next();
    }
    // JS/CSS/favicon, etc. → los sirve useStaticAssets
    if (/\.[a-zA-Z0-9]{1,8}$/.test(path)) {
      return next();
    }
    if (!existsSync(this.indexHtml)) {
      return next();
    }

    return res.sendFile(this.indexHtml);
  }
}
