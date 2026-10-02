import { DestroyRef, type Signal, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { type Params, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';

/**
 * Patrón "la URL es el estado" para listados: los filtros viven en los query params,
 * así un enlace se puede compartir, recargar y el botón "atrás" funciona.
 * Debe llamarse en contexto de inyección.
 */
export function injectQueryState() {
  const router = inject(Router);

  return {
    /** Aplica filtros; por defecto vuelve a la página 1 porque el total cambió. */
    update(params: Params, options: { replaceUrl?: boolean; resetPage?: boolean } = {}): void {
      const { replaceUrl = false, resetPage = true } = options;
      void router.navigate([], {
        queryParams: resetPage ? { ...params, page: null } : params,
        queryParamsHandling: 'merge',
        replaceUrl,
      });
    },
    goToPage(page: number): void {
      void router.navigate([], { queryParams: { page }, queryParamsHandling: 'merge' });
    },
    clear(): void {
      void router.navigate([], { queryParams: {} });
    },
  };
}

/** Aplica el valor de un buscador con debounce (evita una petición por tecla). */
export function onDebounced(source: Signal<string>, apply: (value: string) => void, ms = 350): void {
  toObservable(source)
    .pipe(skip(1), debounceTime(ms), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
    .subscribe(apply);
}

/** Convierte un query param a entero positivo (página), con valor por defecto. */
export function toPage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
