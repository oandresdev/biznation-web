import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../../../core/api/api-error';
import { AutomationApi } from '../../../core/data-access/automation.api';
import { SEGMENTS, type Segment } from '../../../core/models/score.model';
import { ToastService } from '../../../core/notifications/toast.service';
import { injectQueryState, toPage } from '../../../shared/routing/query-state';
import { EmptyState } from '../../../shared/ui/empty-state';
import { LoadError } from '../../../shared/ui/load-error';
import { Paginator } from '../../../shared/ui/paginator';
import { SEGMENT_LABELS, SegmentBadge } from '../../../shared/ui/segment-badge';

const isSegment = (value: string | undefined): value is Segment => SEGMENTS.some((s) => s === value);

@Component({
  selector: 'app-students-page',
  imports: [DatePipe, SegmentBadge, Paginator, EmptyState, LoadError],
  templateUrl: './students-page.html',
  styleUrl: './students-page.scss',
})
export class StudentsPage {
  private readonly automation = inject(AutomationApi);
  private readonly toast = inject(ToastService);
  protected readonly queryState = injectQueryState();

  readonly page = input<string>();
  readonly segmento = input<string>();

  protected readonly segment = computed(() => {
    const value = this.segmento();
    return isSegment(value) ? value : undefined;
  });

  protected readonly summary = this.automation.summary();
  protected readonly tabs = computed(() =>
    SEGMENTS.map((segment) => ({
      segment,
      label: SEGMENT_LABELS[segment].label,
      count: this.summary.value().find((s) => s.segment === segment)?.count ?? 0,
    })),
  );

  protected readonly scores = this.automation.scores(() => {
    const segment = this.segment();
    return { page: toPage(this.page()), limit: 15, ...(segment && { segment }) };
  });

  protected readonly running = signal(false);

  protected async run(): Promise<void> {
    this.running.set(true);
    try {
      const result = await firstValueFrom(this.automation.run());
      this.toast.success(`Clasificación actualizada para ${result.students} estudiantes.`);
      this.summary.reload();
      this.scores.reload();
    } catch (error) {
      this.toast.error(toApiError(error).message);
    } finally {
      this.running.set(false);
    }
  }
}
