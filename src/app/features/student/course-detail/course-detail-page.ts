import { Component, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../../../core/api/api-error';
import { CoursesApi } from '../../../core/data-access/courses.api';
import { type StudentLesson } from '../../../core/models/course.model';
import { ToastService } from '../../../core/notifications/toast.service';
import { LoadError } from '../../../shared/ui/load-error';
import { ProgressBar } from '../../../shared/ui/progress-bar';

@Component({
  selector: 'app-course-detail-page',
  imports: [RouterLink, ProgressBar, LoadError],
  templateUrl: './course-detail-page.html',
  styleUrl: './course-detail-page.scss',
})
export class CourseDetailPage {
  private readonly api = inject(CoursesApi);
  private readonly toast = inject(ToastService);

  /** Parámetro de ruta :id convertido a número en el borde, con tipo garantizado. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly course = this.api.studentCourse(() => this.id());
  protected readonly notFound = computed(() => toApiError(this.course.error()).status === 404);

  protected readonly enrolling = signal(false);
  protected readonly completingId = signal<number | null>(null);

  /** La siguiente lección pendiente: se resalta para que el estudiante sepa por dónde seguir. */
  protected readonly nextLessonId = computed(() =>
    this.course.hasValue() ? (this.course.value().lessons.find((l) => !l.completed)?.id ?? null) : null,
  );

  protected async enroll(): Promise<void> {
    this.enrolling.set(true);
    try {
      await firstValueFrom(this.api.enroll(this.id()));
      this.toast.success('Te inscribiste. Empieza por la primera lección.');
      this.course.reload();
    } catch (error) {
      this.toast.error(toApiError(error).message);
    } finally {
      this.enrolling.set(false);
    }
  }

  protected async complete(lesson: StudentLesson): Promise<void> {
    this.completingId.set(lesson.id);
    try {
      const result = await firstValueFrom(this.api.completeLesson(lesson.id));
      this.toast.success(
        result.courseCompleted ? '¡Completaste el curso!' : `Lección completada. Llevas ${result.courseProgress} %.`,
      );
      this.course.reload();
    } catch (error) {
      this.toast.error(toApiError(error).message);
    } finally {
      this.completingId.set(null);
    }
  }
}
