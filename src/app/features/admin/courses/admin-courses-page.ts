import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoursesApi } from '../../../core/data-access/courses.api';
import { type CourseQuery, type CourseStatus } from '../../../core/models/course.model';
import { injectQueryState, onDebounced, toPage } from '../../../shared/routing/query-state';
import { Badge } from '../../../shared/ui/badge';
import { EmptyState } from '../../../shared/ui/empty-state';
import { LoadError } from '../../../shared/ui/load-error';
import { Paginator } from '../../../shared/ui/paginator';
import { ProgressBar } from '../../../shared/ui/progress-bar';

const STATUS_PARAM = { publicados: 'published', borradores: 'draft' } as const satisfies Record<string, CourseStatus>;
type StatusParam = keyof typeof STATUS_PARAM;
const MIN_PROGRESS_OPTIONS = [25, 50, 75] as const;

const isStatusParam = (value: string | undefined): value is StatusParam => value === 'publicados' || value === 'borradores';
const isIsoDate = (value: string | undefined): value is string => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

@Component({
  selector: 'app-admin-courses-page',
  imports: [RouterLink, DatePipe, Badge, ProgressBar, Paginator, EmptyState, LoadError],
  templateUrl: './admin-courses-page.html',
})
export class AdminCoursesPage {
  protected readonly queryState = injectQueryState();

  readonly page = input<string>();
  readonly q = input<string>();
  readonly estado = input<string>();
  readonly desde = input<string>();
  readonly hasta = input<string>();
  readonly progreso = input<string>();

  protected readonly minProgressOptions = MIN_PROGRESS_OPTIONS;
  protected readonly searchDraft = linkedSignal(() => this.q() ?? '');
  protected readonly status = computed(() => (isStatusParam(this.estado()) ? this.estado() : ''));

  private readonly query = computed<CourseQuery>(() => {
    const estado = this.estado();
    const minProgress = Number(this.progreso());
    return {
      page: toPage(this.page()),
      limit: 10,
      sortBy: 'createdAt',
      order: 'desc',
      ...(this.q() && { title: this.q() }),
      ...(isStatusParam(estado) && { status: STATUS_PARAM[estado] }),
      ...(isIsoDate(this.desde()) && { createdFrom: this.desde() }),
      ...(isIsoDate(this.hasta()) && { createdTo: this.hasta() }),
      ...(MIN_PROGRESS_OPTIONS.some((o) => o === minProgress) && { minProgress }),
    };
  });

  protected readonly courses = inject(CoursesApi).adminCourses(this.query);
  protected readonly hasFilters = computed(
    () => !!(this.q() || this.estado() || this.desde() || this.hasta() || this.progreso()),
  );

  constructor() {
    onDebounced(this.searchDraft, (term) => this.queryState.update({ q: term.trim() || null }, { replaceUrl: true }));
  }

  protected clear(): void {
    this.searchDraft.set('');
    this.queryState.clear();
  }
}
