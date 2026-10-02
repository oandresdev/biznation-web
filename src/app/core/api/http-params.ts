import { HttpParams } from '@angular/common/http';

export type QueryValue = string | number | boolean | null | undefined;

/**
 * Convierte un objeto tipado en HttpParams omitiendo valores vacíos, para que la URL
 * solo lleve los filtros que el usuario realmente aplicó.
 */
export function toHttpParams<T extends { readonly [K in keyof T]: QueryValue }>(query: T): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query) as [string, QueryValue][]) {
    if (value === undefined || value === null || value === '') continue;
    params = params.set(key, String(value));
  }
  return params;
}
