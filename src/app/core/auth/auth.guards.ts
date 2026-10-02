import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { type Role } from '../models/user.model';
import { AuthService } from './auth.service';

/** Exige sesión; si no hay, redirige al login recordando la URL solicitada. */
export const authGuard: CanMatchFn = (_route, segments) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) return true;
  const returnUrl = '/' + segments.map((s) => s.path).join('/');
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl } });
};

/** Solo para visitantes: un usuario con sesión no ve login ni registro. */
export const guestGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).parseUrl(auth.homeUrl()) : true;
};

/**
 * Restringe por rol. Es UX, no seguridad: la autorización real ocurre en el backend.
 * Con canMatch, el código de la sección ni siquiera se descarga para el rol equivocado.
 */
export const roleGuard =
  (role: Role): CanMatchFn =>
  () => {
    const auth = inject(AuthService);
    return auth.role() === role ? true : inject(Router).parseUrl(auth.homeUrl());
  };
