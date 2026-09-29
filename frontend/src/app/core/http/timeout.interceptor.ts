import { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';

/** Evita spinners eternos si Render/Neon tardan demasiado en despertar. */
export const HTTP_TIMEOUT_MS = 45_000;

export const timeoutInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(timeout(HTTP_TIMEOUT_MS));
