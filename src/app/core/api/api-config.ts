import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

/** URL base del API. Inyectable para poder sustituirla en tests o por entorno. */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});
