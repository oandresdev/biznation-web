import { type Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    title: 'Resumen',
    loadComponent: () => import('./dashboard/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'cursos',
    title: 'Cursos',
    loadComponent: () => import('./courses/admin-courses-page').then((m) => m.AdminCoursesPage),
  },
  {
    path: 'cursos/nuevo',
    title: 'Nuevo curso',
    loadComponent: () => import('./course-editor/course-editor-page').then((m) => m.CourseEditorPage),
  },
  {
    path: 'cursos/:id',
    title: 'Editar curso',
    loadComponent: () => import('./course-editor/course-editor-page').then((m) => m.CourseEditorPage),
  },
  {
    path: 'cursos/:id/estudiantes',
    title: 'Avance por estudiante',
    loadComponent: () => import('./course-students/course-students-page').then((m) => m.CourseStudentsPage),
  },
  {
    path: 'estudiantes',
    title: 'Estudiantes',
    loadComponent: () => import('./students/students-page').then((m) => m.StudentsPage),
  },
  {
    path: 'mensajes',
    title: 'Mensajes de WhatsApp',
    loadComponent: () => import('./messages/messages-page').then((m) => m.MessagesPage),
  },
];
