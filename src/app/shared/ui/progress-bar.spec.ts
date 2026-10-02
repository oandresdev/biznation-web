import { TestBed } from '@angular/core/testing';
import { ProgressBar } from './progress-bar';

describe('ProgressBar', () => {
  async function render(value: number) {
    const fixture = TestBed.createComponent(ProgressBar);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('label', 'Progreso en Marketing');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('es accesible: expone rol, valor y nombre', async () => {
    const bar = (await render(42)).querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuenow')).toBe('42');
    expect(bar?.getAttribute('aria-label')).toBe('Progreso en Marketing');
  });

  it('limita el valor al rango 0-100', async () => {
    expect((await render(140)).textContent).toContain('100 %');
    expect((await render(-5)).textContent).toContain('0 %');
  });
});
