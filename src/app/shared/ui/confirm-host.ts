import { Component, type ElementRef, effect, inject, viewChild } from '@angular/core';
import { ConfirmService } from '../../core/notifications/confirm.service';

/** <dialog> nativo: foco atrapado, Escape y accesibilidad sin dependencias. */
@Component({
  selector: 'app-confirm-host',
  template: `
    <dialog #dialog aria-labelledby="confirm-title" (close)="confirm.settle(false)">
      @if (confirm.pending(); as request) {
        <h2 id="confirm-title">{{ request.title }}</h2>
        <p>{{ request.message }}</p>
        <div class="actions">
          <button type="button" class="btn btn-ghost" (click)="dialog.close()">Cancelar</button>
          <button
            type="button"
            class="btn"
            [class.btn-danger]="request.tone === 'danger'"
            [class.btn-primary]="request.tone !== 'danger'"
            (click)="accept()"
          >
            {{ request.confirmLabel }}
          </button>
        </div>
      }
    </dialog>
  `,
  styles: `
    dialog { border: 0; border-radius: var(--radius-lg); padding: var(--space-6); max-width: 28rem; width: calc(100vw - 2rem); color: var(--bn-ink); }
    dialog::backdrop { background: rgb(30 43 57 / 0.55); }
    h2 { margin: 0 0 var(--space-3); font-size: var(--text-lg); }
    p { margin: 0 0 var(--space-5); color: var(--bn-ink-soft); }
    .actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
  `,
})
export class ConfirmHost {
  protected readonly confirm = inject(ConfirmService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.confirm.pending() && !el.open) el.showModal();
    });
  }

  protected accept(): void {
    this.confirm.settle(true);
    this.dialog().nativeElement.close();
  }
}
