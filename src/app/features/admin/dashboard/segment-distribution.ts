import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SEGMENTS, type Segment, type SegmentSummary } from '../../../core/models/score.model';
import { SEGMENT_LABELS } from '../../../shared/ui/segment-badge';

const SEGMENT_COLORS: Readonly<Record<Segment, string>> = {
  en_riesgo: 'var(--bn-danger)',
  activo: 'var(--bn-success)',
  destacado: 'var(--bn-violet)',
  sin_actividad: 'var(--bn-line-strong)',
};

/** Una sola barra proporcional: muestra de un vistazo qué parte de los estudiantes necesita atención. */
@Component({
  selector: 'app-segment-distribution',
  imports: [RouterLink],
  template: `
    @if (total()) {
      <div class="bar" role="img" [attr.aria-label]="ariaLabel()">
        @for (row of rows(); track row.segment) {
          @if (row.count) {
            <span class="slice" [style.flex-grow]="row.count" [style.background]="row.color"></span>
          }
        }
      </div>
      <ul class="legend">
        @for (row of rows(); track row.segment) {
          <li>
            <span class="swatch" [style.background]="row.color" aria-hidden="true"></span>
            <a [routerLink]="['/admin/estudiantes']" [queryParams]="{ segmento: row.segment }">
              <strong>{{ row.count }}</strong> {{ row.label.toLowerCase() }}
            </a>
          </li>
        }
      </ul>
    } @else {
      <p class="empty">Aún no hay estudiantes clasificados. Ejecuta la clasificación para verlos aquí.</p>
    }
  `,
  styles: `
    .bar { display: flex; gap: 3px; height: 1.25rem; border-radius: 999px; overflow: hidden; }
    .slice { min-width: 0.75rem; }
    .legend { list-style: none; display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-5); margin: var(--space-4) 0 0; padding: 0; }
    li { display: flex; align-items: center; gap: var(--space-2); }
    .swatch { width: 0.75rem; height: 0.75rem; border-radius: 3px; }
    a { color: var(--bn-ink); text-decoration: none; }
    a:hover { text-decoration: underline; }
    strong { font-variant-numeric: tabular-nums; }
    .empty { margin: 0; color: var(--bn-ink-soft); }
  `,
})
export class SegmentDistribution {
  readonly summary = input.required<readonly SegmentSummary[]>();

  /** Orden fijo y todos los segmentos presentes, aunque el API no devuelva alguno. */
  protected readonly rows = computed(() =>
    SEGMENTS.map((segment) => ({
      segment,
      label: SEGMENT_LABELS[segment].label,
      color: SEGMENT_COLORS[segment],
      count: this.summary().find((s) => s.segment === segment)?.count ?? 0,
    })),
  );
  protected readonly total = computed(() => this.rows().reduce((sum, r) => sum + r.count, 0));
  protected readonly ariaLabel = computed(() =>
    this.rows().map((r) => `${r.count} ${r.label.toLowerCase()}`).join(', '),
  );
}
