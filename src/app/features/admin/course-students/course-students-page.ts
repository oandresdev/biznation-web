import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoursesApi } from '../../../core/data-access/courses.api';
import { type StudentProgressStatus } from '../../../core/models/progress.model';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { injectQueryState, toPage } from '../../../shared/routing/query-state';
import { EmptyState } from '../../../shared/ui/empty-state';
import { LoadError } from '../../../shared/ui/load-error';
import { Paginator } from '../../../shared/ui/paginator';
import { ProgressBar } from '../../../shared/ui/progress-bar';

const STATUS_TABS = [
  { param: '', label: 'Todos', status: undefined },
  { param: 'en-curso', label: 'En curso', status: 'in_progress' },
  { param: 'sin-empezar', label: 'Sin empezar', status: 'not_started' },
  { param: 'completados', label: 'Completados', status: 'completed' },
] as const satisfies readonly { param: string; label: string; status: StudentProgressStatus | undefined }[];

@Component({
  selector: 'app-course-students-page',
  imports: [RouterLink, DatePipe, RelativeTimePipe, ProgressBar, Paginator, EmptyState, LoadError],
  templateUrl: './course-students-page.html',
})
export class CourseStudentsPage {
  private readonly api = inject(CoursesApi);
  protected readonly queryState = injectQueryState();

  readonly id = input.required({ transform: numberAttribute });
  readonly page = input<string>();
  readonly estado = input<string>();

  protected readonly tabs = STATUS_TABS;
  protected readonly activeTab = computed(() => STATUS_TABS.find((t) => t.param === (this.estado() ?? '')) ?? STATUS_TABS[0]);

  protected readonly course = this.api.adminCourse(() => this.id());
  protected readonly students = this.api.courseStudents(
    () => this.id(),
    () => {
      const status = this.activeTab().status;
      return { page: toPage(this.page()), limit: 15, ...(status && { status }) };
    },
  );
}
