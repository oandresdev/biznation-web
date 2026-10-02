import { Component, input, output } from '@angular/core';
import { type PageMeta } from '../../core/api/page';

@Component({
  selector: 'app-paginator',
  template: `
    @if (meta(); as m) {
      @if (m.totalPages > 1) {
        <nav class="paginator" aria-label="Paginación">
          <button type="button" class="btn btn-ghost" [disabled]="m.page <= 1" (click)="pageChange.emit(m.page - 1)">
            Anterior
          </button>
          <span class="status">Página {{ m.page }} de {{ m.totalPages }}</span>
          <button type="button" class="btn btn-ghost" [disabled]="m.page >= m.totalPages" (click)="pageChange.emit(m.page + 1)">
            Siguiente
          </button>
        </nav>
      }
    }
  `,
  styles: `
    .paginator { display: flex; align-items: center; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-5); }
    .status { color: var(--bn-ink-soft); font-variant-numeric: tabular-nums; }
  `,
})
export class Paginator {
  readonly meta = input<PageMeta | undefined>();
  readonly pageChange = output<number>();
}
