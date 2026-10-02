import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/notifications/toast.service';

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="stack" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="toast" [class]="'toast tone-' + toast.tone" [attr.role]="toast.tone === 'error' ? 'alert' : 'status'">
          <span>{{ toast.message }}</span>
          <button type="button" class="close" aria-label="Cerrar aviso" (click)="toasts.dismiss(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .stack { position: fixed; right: var(--space-5); bottom: var(--space-5); display: grid; gap: var(--space-2); z-index: 50; max-width: min(26rem, calc(100vw - 2rem)); }
    .toast { display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md); background: var(--bn-navy); color: #fff; box-shadow: 0 8px 24px rgb(30 43 57 / 0.25);
      border-left: 4px solid var(--toast-accent, var(--bn-yellow)); }
    .tone-error { --toast-accent: #ff8a80; }
    .tone-success { --toast-accent: var(--bn-yellow); }
    .tone-info { --toast-accent: var(--bn-violet); }
    span { flex: 1; }
    .close { background: none; border: 0; color: inherit; font-size: 1.25rem; line-height: 1; cursor: pointer; padding: 0 0.25rem; }
  `,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
}
