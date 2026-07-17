import {
  Catch,
  ExceptionFilter,
  NotFoundException,
  ArgumentsHost,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import type { Request, Response } from 'express';
import { shouldServeSpa } from './spa-routing';

/**
 * Deep links del front Angular (/catalogo/:id, etc.) no existen como archivos.
 * Si Nest devolvería 404 fuera de /api, servimos index.html (SPA).
 */
@Catch(NotFoundException)
export class SpaNotFoundFilter implements ExceptionFilter {
  private readonly indexHtml = join(__dirname, '..', '..', 'public', 'index.html');
  private readonly enabled = existsSync(this.indexHtml);

  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const path = req.path || '';
    if (this.enabled && shouldServeSpa(req.method, path)) {
      return res.sendFile(this.indexHtml);
    }

    const status = exception.getStatus();
    const body = exception.getResponse();
    res.status(status).json(
      typeof body === 'string' ? { statusCode: status, message: body } : body,
    );
  }
}
