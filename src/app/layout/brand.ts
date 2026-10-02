import { Component } from '@angular/core';

/** Marca: la bombilla de Biz Nation reducida a su gesto, el punto amarillo. */
@Component({
  selector: 'app-brand',
  template: `<span class="dot" aria-hidden="true"></span><span class="name">Biz Nation</span>`,
  styles: `
    :host { display: inline-flex; align-items: center; gap: 0.6rem; font: 800 1.25rem/1 var(--font-display); letter-spacing: -0.02em; }
    .dot { width: 0.85rem; height: 0.85rem; border-radius: 50%; background: var(--bn-yellow); box-shadow: 0 0 0 4px rgb(255 210 63 / 0.25); }
  `,
})
export class Brand {}
