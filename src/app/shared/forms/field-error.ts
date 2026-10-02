import { Component, type Signal, computed, input } from '@angular/core';

/** Tipo estructural: cualquier FieldState de Signal Forms lo cumple. */
export interface FieldStateLike {
  readonly touched: Signal<boolean>;
  readonly errors: Signal<readonly { readonly kind: string; readonly message?: string }[]>;
}

/** Muestra el primer error de un campo, solo después de que el usuario lo tocó. */
@Component({
  selector: 'app-field-error',
  template: `
    @if (message(); as text) {
      <p class="field-error" [id]="id()">{{ text }}</p>
    }
  `,
})
export class FieldError {
  readonly state = input.required<FieldStateLike>();
  readonly id = input<string>();
  protected readonly message = computed(() => {
    const state = this.state();
    if (!state.touched()) return null;
    const [first] = state.errors();
    return first ? (first.message ?? 'Revisa este campo') : null;
  });
}
