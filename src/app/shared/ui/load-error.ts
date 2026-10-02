import { Component, computed, input, output } from '@angular/core';
import { toApiError } from '../../core/api/api-error';

/** Error de carga de un recurso con opción de reintentar. Acepta el error crudo del resource. */
@Component({
  selector: 'app-load-error',
  template: `
    <div class="load-error" role="alert">
      <p>{{ message() }}</p>
      <button type="button" class="btn btn-secondary" (click)="retry.emit()">Reintentar</button>
    </div>
  `,
  styles: `
    .load-error { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
      padding: var(--space-4) var(--space-5); border-radius: var(--radius-md); background: #fbe6e4; color: var(--bn-danger); }
    p { margin: 0; }
  `,
})
export class LoadError {
  readonly error = input<unknown>();
  readonly retry = output();
  protected readonly message = computed(() => toApiError(this.error()).message);
}
