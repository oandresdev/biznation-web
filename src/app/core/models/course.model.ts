import { type SortOrder } from '../api/page';

interface CourseBase {
  readonly id: number;
  readonly title: string;
  readonly description: string | null;
  readonly lessonsCount: number;
  readonly createdAt: string;
}

/** Vista de estudiante: solo cursos publicados, con su propio progreso. */
export interface StudentCourse extends CourseBase {
  readonly isEnrolled: boolean;
  readonly myProgress: number;
}

export interface CourseStats {
  readonly enrolledCount: number;
  readonly completedCount: number;
  readonly avgProgress: number;
  readonly completionRate: number;
}

/** Vista de administrador: incluye borradores y métricas agregadas. */
export interface AdminCourse extends CourseBase {
  readonly isPublished: boolean;
  readonly publishedAt: string | null;
  readonly stats: CourseStats;
}

export interface StudentLesson {
  readonly id: number;
  readonly title: string;
  readonly position: number;
  readonly completed: boolean;
}

export interface AdminLesson {
  readonly id: number;
  readonly title: string;
  readonly position: number;
  readonly content: string | null;
}

export type StudentCourseDetail = StudentCourse & { readonly lessons: readonly StudentLesson[] };
export type AdminCourseDetail = AdminCourse & { readonly lessons: readonly AdminLesson[] };

/** Entidad tal como la devuelven las operaciones de escritura. */
export interface Course {
  readonly id: number;
  readonly title: string;
  readonly description: string | null;
  readonly isPublished: boolean;
  readonly publishedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CourseInput {
  readonly title: string;
  readonly description: string | null;
}

export interface LessonInput {
  readonly title: string;
  readonly content?: string | null;
  readonly position?: number;
}

export type CourseSortBy = 'createdAt' | 'title' | 'progress';
export type CourseStatus = 'published' | 'draft';

export interface CourseQuery {
  readonly page: number;
  readonly limit: number;
  readonly title?: string;
  readonly createdFrom?: string;
  readonly createdTo?: string;
  readonly minProgress?: number;
  readonly maxProgress?: number;
  readonly enrolled?: boolean;
  readonly status?: CourseStatus;
  readonly sortBy: CourseSortBy;
  readonly order: SortOrder;
}
