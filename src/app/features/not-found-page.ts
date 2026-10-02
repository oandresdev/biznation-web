import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <main class="not-found">
      <h1>Esta página no existe</h1>
      <p>Puede que el enlace esté mal escrito o que el contenido ya no esté disponible.</p>
      <a class="btn btn-primary" [routerLink]="auth.homeUrl()">Ir al inicio</a>
    </main>
  `,
  styles: `
    .not-found { max-width: 36rem; margin: 18vh auto 0; padding: 0 var(--space-5); }
    p { color: var(--bn-ink-soft); margin: var(--space-3) 0 var(--space-5); }
  `,
})
export class NotFoundPage {
  protected readonly auth = inject(AuthService);
}
