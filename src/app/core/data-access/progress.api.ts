import { httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../api/api-config';
import { type MyProgress } from '../models/progress.model';

@Injectable({ providedIn: 'root' })
export class ProgressApi {
  private readonly url = `${inject(API_URL)}/me/progress`;

  myProgress() {
    return httpResource<MyProgress>(() => this.url);
  }
}
