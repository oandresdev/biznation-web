import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  const pipe = new RelativeTimePipe();
  const now = new Date('2026-10-02T12:00:00Z');

  it('expresa fechas pasadas en lenguaje natural', () => {
    expect(pipe.transform('2026-09-29T12:00:00Z', now)).toBe('hace 3 días');
    expect(pipe.transform('2026-10-01T12:00:00Z', now)).toBe('ayer');
    expect(pipe.transform('2026-10-02T11:59:50Z', now)).toBe('hace un momento');
  });

  it('indica cuando no hay actividad', () => {
    expect(pipe.transform(null, now)).toBe('Sin actividad');
  });
});
