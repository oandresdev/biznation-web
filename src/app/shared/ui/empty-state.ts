import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <h3>{{ heading() }}</h3>
    <p>{{ message() }}</p>
    <ng-content />
  `,
  styles: `
    :host { display: block; padding: var(--space-7) var(--space-5); border: 1px dashed var(--bn-line-strong); border-radius: var(--radius-md); }
    h3 { margin: 0 0 var(--space-2); font-size: var(--text-lg); }
    p { margin: 0 0 var(--space-4); color: var(--bn-ink-soft); max-width: 52ch; }
  `,
})
export class EmptyState {
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
}
