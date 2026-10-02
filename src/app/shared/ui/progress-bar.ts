import { Component, computed, input } from '@angular/core';

/** Barra de progreso: el elemento visual protagonista de la plataforma. */
@Component({
  selector: 'app-progress-bar',
  template: `
    <div
      class="track"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="clamped()"
      [attr.aria-label]="label()"
    >
      <div class="fill" [class.complete]="clamped() === 100" [style.width.%]="clamped()"></div>
    </div>
    @if (showValue()) {
      <span class="value">{{ clamped() }} %</span>
    }
  `,
  styles: `
    :host { display: flex; align-items: center; gap: var(--space-3); min-width: 8rem; }
    .track { flex: 1; height: var(--bar-height, 0.625rem); border-radius: 999px; background: var(--bn-track); overflow: hidden; }
    .fill { height: 100%; border-radius: inherit; background: var(--bn-yellow); transition: width 400ms ease; }
    .fill.complete { background: var(--bn-yellow-strong); }
    .value { font-variant-numeric: tabular-nums; font-weight: 600; min-width: 3.25rem; text-align: right; color: var(--bn-ink); }
    :host(.lg) { --bar-height: 1rem; }
    @media (prefers-reduced-motion: reduce) { .fill { transition: none; } }
  `,
})
export class ProgressBar {
  readonly value = input.required<number>();
  readonly label = input('Progreso');
  readonly showValue = input(true);
  protected readonly clamped = computed(() => Math.round(Math.min(100, Math.max(0, this.value()))));
}
