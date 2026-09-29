import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

function isAuthCredentialRequest(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/register');
}

function isSessionCheck(url: string): boolean {
  return url.includes('/auth/me');
}

/**
 * Adjunta JWT y, si la API responde 401 (token inválido tras redeploy, etc.),
 * cierra sesión y manda a login en lugar de dejar el catálogo “muerto”.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;
  const outgoing = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        !isAuthCredentialRequest(req.url) &&
        auth.isLoggedIn()
      ) {
        auth.clearSession();
        // /auth/me lo gestiona el guard; el resto redirige aquí.
        if (!isSessionCheck(req.url)) {
          void router.navigateByUrl('/login');
        }
      }
      return throwError(() => err);
    }),
  );
};
