import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoursesApi } from '../../../core/data-access/courses.api';
import { EmptyState } from '../../../shared/ui/empty-state';
import { LoadError } from '../../../shared/ui/load-error';
import { Paginator } from '../../../shared/ui/paginator';
import { ProgressBar } from '../../../shared/ui/progress-bar';
import { injectQueryState, onDebounced } from '../../../shared/routing/query-state';
import {
  PROGRESS_FILTERS,
  SORT_OPTIONS,
  asProgressFilter,
  asSortOption,
  toCourseQuery,
} from './catalog-filters';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, ProgressBar, Paginator, EmptyState, LoadError],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  private readonly api = inject(CoursesApi);
  protected readonly queryState = injectQueryState();

  // Query params → inputs. La URL es la única fuente de verdad de los filtros.
  readonly page = input<string>();
  readonly q = input<string>();
  readonly progreso = input<string>();
  readonly orden = input<string>();
  readonly mios = input<string>();

  protected readonly progressOptions = Object.entries(PROGRESS_FILTERS);
  protected readonly sortOptions = Object.entries(SORT_OPTIONS);

  protected readonly progressFilter = computed(() => asProgressFilter(this.progreso()));
  protected readonly sort = computed(() => asSortOption(this.orden()));
  protected readonly onlyMine = computed(() => this.mios() === '1');

  /** Borrador del buscador: sigue a la URL, pero se edita localmente y se aplica con debounce. */
  protected readonly searchDraft = linkedSignal(() => this.q() ?? '');

  private readonly query = computed(() =>
    toCourseQuery({ page: this.page(), q: this.q(), progreso: this.progreso(), orden: this.orden(), mios: this.mios() }),
  );
  protected readonly courses = this.api.studentCourses(this.query);

  protected readonly hasFilters = computed(() => !!(this.q() || this.progreso() || this.mios()));

  constructor() {
    onDebounced(this.searchDraft, (term) => this.queryState.update({ q: term.trim() || null }, { replaceUrl: true }));
  }

  protected setProgress(value: string): void {
    this.queryState.update({ progreso: value || null });
  }

  protected setSort(value: string): void {
    this.queryState.update({ orden: value === 'recientes' ? null : value });
  }

  protected toggleMine(checked: boolean): void {
    this.queryState.update({ mios: checked ? '1' : null });
  }

  protected clearFilters(): void {
    this.searchDraft.set('');
    this.queryState.clear();
  }
}
