import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../../../core/api/api-error';
import { WebhooksApi } from '../../../core/data-access/webhooks.api';
import { type MessageIntent, type WebhookEvent, type WebhookStatus } from '../../../core/models/webhook.model';
import { ToastService } from '../../../core/notifications/toast.service';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { injectQueryState, toPage } from '../../../shared/routing/query-state';
import { Badge, type BadgeTone } from '../../../shared/ui/badge';
import { EmptyState } from '../../../shared/ui/empty-state';
import { LoadError } from '../../../shared/ui/load-error';
import { Paginator } from '../../../shared/ui/paginator';

type Meta = Readonly<{ label: string; tone: BadgeTone }>;

const STATUS_META: Readonly<Record<WebhookStatus, Meta>> = {
  pending: { label: 'En cola', tone: 'warning' },
  processing: { label: 'Procesando', tone: 'warning' },
  processed: { label: 'Procesado', tone: 'success' },
  failed: { label: 'Falló', tone: 'danger' },
};

const INTENT_META: Readonly<Record<MessageIntent, Meta>> = {
  soporte: { label: 'Soporte', tone: 'danger' },
  pagos: { label: 'Pagos', tone: 'highlight' },
  inscripcion: { label: 'Inscripción', tone: 'accent' },
  otro: { label: 'Otro', tone: 'neutral' },
};

const STATUS_FILTERS = ['failed', 'pending', 'processed'] as const satisfies readonly WebhookStatus[];
const isStatusFilter = (value: string | undefined): value is (typeof STATUS_FILTERS)[number] =>
  STATUS_FILTERS.some((s) => s === value);

@Component({
  selector: 'app-messages-page',
  imports: [DatePipe, RelativeTimePipe, Badge, Paginator, EmptyState, LoadError],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.scss',
})
export class MessagesPage {
  private readonly api = inject(WebhooksApi);
  private readonly toast = inject(ToastService);
  protected readonly queryState = injectQueryState();

  readonly page = input<string>();
  readonly estado = input<string>();

  protected readonly statusMeta = STATUS_META;
  protected readonly intentMeta = INTENT_META;
  protected readonly statusFilters = STATUS_FILTERS;

  protected readonly status = computed(() => {
    const value = this.estado();
    return isStatusFilter(value) ? value : undefined;
  });

  protected readonly events = this.api.events(() => {
    const status = this.status();
    return { page: toPage(this.page()), limit: 20, ...(status && { status }) };
  });

  protected readonly retryingId = signal<number | null>(null);

  protected async retry(event: WebhookEvent): Promise<void> {
    this.retryingId.set(event.id);
    try {
      await firstValueFrom(this.api.retry(event.id));
      this.toast.info('Mensaje enviado de nuevo a la cola. Actualiza en unos segundos para ver el resultado.');
      this.events.reload();
    } catch (error) {
      this.toast.error(toApiError(error).message);
    } finally {
      this.retryingId.set(null);
    }
  }
}
