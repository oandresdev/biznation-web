import { Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent' | 'highlight';

@Component({
  selector: 'app-badge',
  template: `<ng-content />`,
  host: { '[class]': '"tone-" + tone()' },
  styles: `
    :host {
      display: inline-flex; align-items: center; gap: 0.35em; padding: 0.15em 0.6em;
      border-radius: 999px; font-size: var(--text-sm); font-weight: 600; white-space: nowrap;
      background: var(--badge-bg); color: var(--badge-fg);
    }
    :host(.tone-neutral) { --badge-bg: var(--bn-track); --badge-fg: var(--bn-ink-soft); }
    :host(.tone-success) { --badge-bg: #e3f4ec; --badge-fg: var(--bn-success); }
    :host(.tone-warning) { --badge-bg: #fdf1dc; --badge-fg: var(--bn-warning); }
    :host(.tone-danger) { --badge-bg: #fbe6e4; --badge-fg: var(--bn-danger); }
    :host(.tone-accent) { --badge-bg: #efe5fd; --badge-fg: var(--bn-violet-ink); }
    :host(.tone-highlight) { --badge-bg: var(--bn-yellow); --badge-fg: var(--bn-navy); }
  `,
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
}
