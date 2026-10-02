import { Pipe, type PipeTransform } from '@angular/core';

const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "hace 3 días", "ayer", "hace un momento". */
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, now: Date = new Date()): string {
    if (!value) return 'Sin actividad';
    const seconds = Math.round((new Date(value).getTime() - now.getTime()) / 1000);
    for (const [unit, size] of UNITS) {
      if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
    }
    return 'hace un momento';
  }
}
