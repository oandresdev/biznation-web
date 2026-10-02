import { type Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cursos' },
  {
    path: 'cursos',
    title: 'Cursos',
    loadComponent: () => import('./catalog/catalog-page').then((m) => m.CatalogPage),
  },
  {
    path: 'cursos/:id',
    title: 'Curso',
    loadComponent: () => import('./course-detail/course-detail-page').then((m) => m.CourseDetailPage),
  },
  {
    path: 'mi-progreso',
    title: 'Mi progreso',
    loadComponent: () => import('./my-progress/my-progress-page').then((m) => m.MyProgressPage),
  },
];
