import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable } from 'rxjs';
import { API_URL } from '../api/api-config';
import { toHttpParams } from '../api/http-params';
import { type Page } from '../api/page';
import { type Segment, type ScoringRun, type SegmentSummary, type UserScore } from '../models/score.model';

@Injectable({ providedIn: 'root' })
export class AutomationApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/automation/scores`;

  summary() {
    return httpResource<readonly SegmentSummary[]>(() => `${this.url}/summary`, { defaultValue: [] });
  }

  scores(query: () => { page: number; limit: number; segment?: Segment }) {
    return httpResource<Page<UserScore>>(() => ({ url: this.url, params: toHttpParams(query()) }));
  }

  run(): Observable<ScoringRun> {
    return this.http.post<ScoringRun>(`${this.url}/run`, {});
  }
}
