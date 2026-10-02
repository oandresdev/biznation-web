import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable } from 'rxjs';
import { API_URL } from '../api/api-config';
import { toHttpParams } from '../api/http-params';
import { type Page } from '../api/page';
import { type WebhookEvent, type WebhookEventQuery } from '../models/webhook.model';

@Injectable({ providedIn: 'root' })
export class WebhooksApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/webhooks/events`;

  events(query: () => WebhookEventQuery) {
    return httpResource<Page<WebhookEvent>>(() => ({ url: this.url, params: toHttpParams(query()) }));
  }

  retry(id: number): Observable<WebhookEvent> {
    return this.http.post<WebhookEvent>(`${this.url}/${id}/retry`, {});
  }
}
