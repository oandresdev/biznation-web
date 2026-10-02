import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable } from 'rxjs';
import { API_URL } from '../api/api-config';
import { toHttpParams } from '../api/http-params';
import { type Page } from '../api/page';
import {
  type AdminCourse,
  type AdminCourseDetail,
  type AdminLesson,
  type Course,
  type CourseInput,
  type CourseQuery,
  type LessonInput,
  type StudentCourse,
  type StudentCourseDetail,
} from '../models/course.model';
import { type CourseStudent, type Enrollment, type LessonCompletion, type StudentProgressStatus } from '../models/progress.model';

/**
 * Acceso a cursos, lecciones y progreso.
 * - Lecturas: httpResource. Recibe funciones reactivas: cuando cambian los filtros, la petición
 *   se repite sola y la anterior se cancela. Deben crearse en contexto de inyección
 *   (inicializadores de campo de un componente).
 * - Escrituras: Observables de HttpClient, disparados por acciones del usuario.
 */
@Injectable({ providedIn: 'root' })
export class CoursesApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/courses`;
  private readonly lessonsUrl = `${inject(API_URL)}/lessons`;

  // ----- Lecturas -----
  studentCourses(query: () => CourseQuery) {
    return httpResource<Page<StudentCourse>>(() => ({ url: this.url, params: toHttpParams(query()) }));
  }

  adminCourses(query: () => CourseQuery) {
    return httpResource<Page<AdminCourse>>(() => ({ url: this.url, params: toHttpParams(query()) }));
  }

  /** `undefined` como id deja el recurso inactivo (p. ej. en la pantalla de "nuevo curso"). */
  studentCourse(id: () => number | undefined) {
    return httpResource<StudentCourseDetail>(() => {
      const courseId = id();
      return courseId === undefined ? undefined : `${this.url}/${courseId}`;
    });
  }

  adminCourse(id: () => number | undefined) {
    return httpResource<AdminCourseDetail>(() => {
      const courseId = id();
      return courseId === undefined ? undefined : `${this.url}/${courseId}`;
    });
  }

  courseStudents(id: () => number, query: () => { page: number; limit: number; status?: StudentProgressStatus }) {
    return httpResource<Page<CourseStudent>>(() => ({
      url: `${this.url}/${id()}/students`,
      params: toHttpParams(query()),
    }));
  }

  // ----- Escrituras (admin) -----
  create(input: CourseInput): Observable<Course> {
    return this.http.post<Course>(this.url, input);
  }

  update(id: number, input: Partial<CourseInput>): Observable<Course> {
    return this.http.patch<Course>(`${this.url}/${id}`, input);
  }

  setPublished(id: number, published: boolean): Observable<Course> {
    return this.http.patch<Course>(`${this.url}/${id}/publish`, { published });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  addLesson(courseId: number, input: LessonInput): Observable<AdminLesson> {
    return this.http.post<AdminLesson>(`${this.url}/${courseId}/lessons`, input);
  }

  removeLesson(lessonId: number): Observable<void> {
    return this.http.delete<void>(`${this.lessonsUrl}/${lessonId}`);
  }

  // ----- Escrituras (estudiante) -----
  enroll(courseId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.url}/${courseId}/enroll`, {});
  }

  completeLesson(lessonId: number): Observable<LessonCompletion> {
    return this.http.post<LessonCompletion>(`${this.lessonsUrl}/${lessonId}/complete`, {});
  }
}
