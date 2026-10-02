import { Component, input } from '@angular/core';
import { Brand } from '../../layout/brand';

/** Marco compartido de login y registro: marca a la izquierda, formulario a la derecha. */
@Component({
  selector: 'app-auth-frame',
  imports: [Brand],
  template: `
    <div class="frame">
      <section class="intro">
        <app-brand />
        <p class="pitch">Aprende a tu ritmo y mira tu avance en cada lección.</p>
        <div class="stripes" aria-hidden="true"></div>
      </section>
      <main class="form-side">
        <div class="form-box">
          <h1>{{ heading() }}</h1>
          <ng-content />
        </div>
      </main>
    </div>
  `,
  styles: `
    .frame { display: grid; grid-template-columns: minmax(18rem, 2fr) 3fr; min-height: 100dvh; }
    .intro { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
      padding: var(--space-7) var(--space-6); background: var(--bn-navy); color: #fff; }
    .pitch { position: relative; z-index: 1; max-width: 18ch; margin: 0; font: 700 var(--text-xl)/1.25 var(--font-display); }
    /* Las franjas violeta del material de marca, como textura en una esquina. */
    .stripes { position: absolute; right: -5rem; top: -5rem; width: 16rem; height: 16rem; border-radius: 50%;
      background: repeating-linear-gradient(135deg, var(--bn-violet) 0 6px, transparent 6px 16px); opacity: 0.55; }
    .form-side { display: grid; place-items: center; padding: var(--space-7) var(--space-5); }
    .form-box { width: 100%; max-width: 24rem; }
    h1 { margin-bottom: var(--space-5); }
    @media (max-width: 48rem) {
      .frame { grid-template-columns: 1fr; }
      .intro { padding: var(--space-5); gap: var(--space-5); }
      .pitch { font-size: var(--text-lg); max-width: none; }
      .stripes { width: 9rem; height: 9rem; right: -3.5rem; top: -3.5rem; }
    }
  `,
})
export class AuthFrame {
  readonly heading = input.required<string>();
}
