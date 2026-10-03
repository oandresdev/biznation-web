import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormField, FormRoot, type TreeValidationResult, form, maxLength, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../../../core/api/api-error';
import { CoursesApi } from '../../../core/data-access/courses.api';
import { type AdminLesson } from '../../../core/models/course.model';
import { ConfirmService } from '../../../core/notifications/confirm.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { FieldError } from '../../../shared/forms/field-error';
import { serverErrors } from '../../../shared/forms/server-errors';
import { Badge } from '../../../shared/ui/badge';
import { LoadError } from '../../../shared/ui/load-error';

interface CourseFormModel {
  title: string;
  description: string;
}

interface LessonFormModel {
  title: string;
  content: string;
}

/** "nuevo" (sin :id) o un id inválido → undefined: el recurso queda inactivo y la pantalla crea. */
function toOptionalId(value: string | undefined): number | undefined {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

/** details del 409 COURSE_HAS_PROGRESS, validado en tiempo de ejecución (llega como unknown). */
function studentsWithProgress(details: unknown): number {
  if (typeof details === 'object' && details !== null && 'studentsWithProgress' in details) {
    const value = details.studentsWithProgress;
    if (typeof value === 'number') return value;
  }
  return 0;
}

@Component({
  selector: 'app-course-editor-page',
  imports: [RouterLink, FormRoot, FormField, FieldError, Badge, LoadError],
  templateUrl: './course-editor-page.html',
  styleUrl: './course-editor-page.scss',
})
export class CourseEditorPage {
  private readonly api = inject(CoursesApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly id = input<number | undefined, string | undefined>(undefined, { transform: toOptionalId });

  protected readonly isNew = computed(() => this.id() === undefined);
  protected readonly course = this.api.adminCourse(() => this.id());

  // ----- Datos del curso -----
  /** Valores guardados. El `equal` evita pisar lo que el admin está escribiendo cuando el curso se recarga sin cambios. */
  private readonly savedValues = computed<CourseFormModel>(
    () => {
      const c = this.course.hasValue() ? this.course.value() : null;
      return { title: c?.title ?? '', description: c?.description ?? '' };
    },
    { equal: (a, b) => a.title === b.title && a.description === b.description },
  );
  protected readonly model = linkedSignal(() => this.savedValues());

  protected readonly courseForm = form(
    this.model,
    (path) => {
      required(path.title, { message: 'Escribe un título' });
      minLength(path.title, 3, { message: 'El título debe tener al menos 3 caracteres' });
      maxLength(path.title, 150, { message: 'Máximo 150 caracteres' });
      required(path.description, { message: 'Escribe una descripción' });
      maxLength(path.description, 2000, { message: 'Máximo 2.000 caracteres' });
    },
    { submission: { action: () => this.save() } },
  );

  protected readonly courseFormError = computed(
    () => this.courseForm().errors().find((e) => e.kind === 'server')?.message ?? null,
  );

  // ----- Lecciones -----
  protected readonly lessonModel = signal<LessonFormModel>({ title: '', content: '' });
  protected readonly lessonForm = form(
    this.lessonModel,
    (path) => {
      required(path.title, { message: 'Escribe el título de la lección' });
      minLength(path.title, 3, { message: 'El título debe tener al menos 3 caracteres' });
    },
    { submission: { action: () => this.addLesson() } },
  );

  // ----- Estado de acciones -----
  protected readonly publishing = signal(false);
  protected readonly deleting = signal(false);
  protected readonly removingLessonId = signal<number | null>(null);
  /** Si el backend bloqueó el borrado, cuántos estudiantes tienen progreso. */
  protected readonly deleteBlockedBy = signal<number | null>(null);

  private async save(): Promise<TreeValidationResult> {
    const { title, description } = this.model();
    const input = { title: title.trim(), description: description.trim() || null };
    const id = this.id();
    try {
      if (id === undefined) {
        const created = await firstValueFrom(this.api.create(input));
        this.toast.success('Curso creado como borrador. Agrega lecciones para publicarlo.');
        await this.router.navigate(['/admin/cursos', created.id], { replaceUrl: true });
      } else {
        await firstValueFrom(this.api.update(id, input));
        this.toast.success('Cambios guardados.');
        this.course.reload();
      }
      return undefined;
    } catch (error) {
      return serverErrors(toApiError(error), { title: this.courseForm.title, description: this.courseForm.description });
    }
  }

  private async addLesson(): Promise<TreeValidationResult> {
    const id = this.id();
    if (id === undefined) return undefined;
    const { title, content } = this.lessonModel();
    try {
      await firstValueFrom(this.api.addLesson(id, { title: title.trim(), content: content.trim() || null }));
      this.lessonForm().reset({ title: '', content: '' });
      this.toast.success('Lección agregada.');
      this.course.reload();
      return undefined;
    } catch (error) {
      return serverErrors(toApiError(error), { title: this.lessonForm.title });
    }
  }

  protected async setPublished(published: boolean): Promise<void> {
    const id = this.id();
    if (id === undefined) return;
    this.publishing.set(true);
    try {
      await firstValueFrom(this.api.setPublished(id, published));
      this.toast.success(published ? 'Curso publicado. Ya lo ven los estudiantes.' : 'Curso despublicado.');
      this.deleteBlockedBy.set(null);
      this.course.reload();
    } catch (error) {
      this.toast.error(toApiError(error).message);
    } finally {
      this.publishing.set(false);
    }
  }

  protected async removeLesson(lesson: AdminLesson): Promise<void> {
    const accepted = await this.confirm.ask({
      title: 'Eliminar lección',
      message: `"${lesson.title}" dejará de estar disponible. El progreso de los inscritos se recalculará.`,
      confirmLabel: 'Eliminar lección',
      tone: 'danger',
    });
    if (!accepted) return;

    this.removingLessonId.set(lesson.id);
    try {
      await firstValueFrom(this.api.removeLesson(lesson.id));
      this.toast.success('Lección eliminada.');
      this.course.reload();
    } catch (error) {
      this.toast.error(toApiError(error).message);
    } finally {
      this.removingLessonId.set(null);
    }
  }

  protected async deleteCourse(): Promise<void> {
    const id = this.id();
    if (id === undefined) return;
    const accepted = await this.confirm.ask({
      title: 'Eliminar curso',
      message: 'El curso y sus lecciones dejarán de estar disponibles. Podrás restaurarlo desde el API si fue un error.',
      confirmLabel: 'Eliminar curso',
      tone: 'danger',
    });
    if (!accepted) return;

    this.deleting.set(true);
    try {
      await firstValueFrom(this.api.remove(id));
      this.toast.success('Curso eliminado.');
      await this.router.navigate(['/admin/cursos']);
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.is('COURSE_HAS_PROGRESS')) {
        this.deleteBlockedBy.set(studentsWithProgress(apiError.details));
      } else {
        this.toast.error(apiError.message);
      }
    } finally {
      this.deleting.set(false);
    }
  }
}
