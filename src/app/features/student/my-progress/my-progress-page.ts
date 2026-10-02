import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressApi } from '../../../core/data-access/progress.api';
import { type Segment } from '../../../core/models/score.model';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { EmptyState } from '../../../shared/ui/empty-state';
import { LoadError } from '../../../shared/ui/load-error';
import { ProgressBar } from '../../../shared/ui/progress-bar';
import { SegmentBadge } from '../../../shared/ui/segment-badge';

/** Mensaje para el estudiante según su segmento: orientado a la siguiente acción, no a la etiqueta. */
const SEGMENT_MESSAGES: Readonly<Record<Segment, string>> = {
  destacado: 'Vas muy bien. Mantén este ritmo y terminarás pronto tus cursos.',
  activo: 'Vas avanzando. Una lección más esta semana te acerca a terminar.',
  en_riesgo: 'Hace tiempo no avanzas. Retoma hoy con una lección corta.',
  sin_actividad: 'Aún no empiezas. Inscríbete en un curso para comenzar.',
};

@Component({
  selector: 'app-my-progress-page',
  imports: [RouterLink, DatePipe, ProgressBar, SegmentBadge, EmptyState, LoadError, RelativeTimePipe],
  templateUrl: './my-progress-page.html',
  styleUrl: './my-progress-page.scss',
})
export class MyProgressPage {
  protected readonly progress = inject(ProgressApi).myProgress();

  protected readonly segmentMessage = computed(() => {
    const score = this.progress.hasValue() ? this.progress.value().score : null;
    return score ? SEGMENT_MESSAGES[score.segment] : null;
  });
}
