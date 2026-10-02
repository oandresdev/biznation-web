import { type HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api/api-config';
import { AuthService } from './auth.service';

/** Adjunta el JWT solo a peticiones hacia nuestro API (nunca a terceros). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (!token || !req.url.startsWith(inject(API_URL))) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

/**
 * Un 401 en una ruta protegida significa sesión inválida (expirada o usuario desactivado):
 * se cierra la sesión y se vuelve al login conservando la página a la que iba.
 * Se excluye /auth/* porque ahí un 401 es un error de formulario (credenciales).
 */
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/') && auth.isAuthenticated()) {
        auth.logout({ reason: 'expired', returnUrl: router.url });
      }
      return throwError(() => error);
    }),
  );
};
