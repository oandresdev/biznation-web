import { inject } from '@angular/core';
import { type Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
import { AuthService } from './core/auth/auth.service';

/**
 * Cada sección se carga bajo demanda. canMatch evita incluso descargar el código de
 * administración si quien navega es un estudiante.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: () => inject(AuthService).homeUrl() },
  {
    path: 'login',
    title: 'Iniciar sesión',
    canMatch: [guestGuard],
    loadComponent: () => import('./features/auth/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    title: 'Crear cuenta',
    canMatch: [guestGuard],
    loadComponent: () => import('./features/auth/register-page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      {
        path: 'admin',
        canMatch: [roleGuard('admin')],
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: '',
        canMatch: [roleGuard('student')],
        loadChildren: () => import('./features/student/student.routes').then((m) => m.STUDENT_ROUTES),
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () => import('./features/not-found-page').then((m) => m.NotFoundPage),
  },
];
