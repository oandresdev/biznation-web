export type WebhookStatus = 'pending' | 'processing' | 'processed' | 'failed';
export type MessageIntent = 'soporte' | 'pagos' | 'inscripcion' | 'otro';

export interface MessageResult {
  readonly intent: MessageIntent;
  readonly confidence: number;
  readonly matchedKeywords: readonly string[];
  readonly userId: number | null;
  readonly from: string;
}

export interface StatusResult {
  readonly deliveryStatus: string;
}

interface WebhookEventBase {
  readonly id: number;
  readonly provider: string;
  readonly externalEventId: string;
  readonly status: WebhookStatus;
  readonly attempts: number;
  readonly lastError: string | null;
  readonly nextRetryAt: string | null;
  readonly processedAt: string | null;
  readonly createdAt: string;
}

/** Unión discriminada por eventType: TypeScript sabe qué forma tienen payload y result en cada caso. */
export type WebhookEvent =
  | (WebhookEventBase & {
      readonly eventType: 'message';
      readonly payload: { readonly from: string; readonly text?: { readonly body: string } };
      readonly result: MessageResult | null;
    })
  | (WebhookEventBase & {
      readonly eventType: 'status';
      readonly payload: { readonly status: string };
      readonly result: StatusResult | null;
    });

export interface WebhookEventQuery {
  readonly page: number;
  readonly limit: number;
  readonly status?: WebhookStatus;
}
