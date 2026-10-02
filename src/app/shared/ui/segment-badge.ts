import { Component, computed, input } from '@angular/core';
import { type Segment } from '../../core/models/score.model';
import { Badge, type BadgeTone } from './badge';

/** Etiquetas en lenguaje del equipo, no en el del sistema. Record<Segment, …> obliga a cubrir todos. */
export const SEGMENT_LABELS: Readonly<Record<Segment, { readonly label: string; readonly tone: BadgeTone }>> = {
  destacado: { label: 'Destacado', tone: 'accent' },
  activo: { label: 'Activo', tone: 'success' },
  en_riesgo: { label: 'En riesgo', tone: 'danger' },
  sin_actividad: { label: 'Sin actividad', tone: 'neutral' },
};

@Component({
  selector: 'app-segment-badge',
  imports: [Badge],
  template: `<app-badge [tone]="meta().tone">{{ meta().label }}</app-badge>`,
})
export class SegmentBadge {
  readonly segment = input.required<Segment>();
  protected readonly meta = computed(() => SEGMENT_LABELS[this.segment()]);
}
