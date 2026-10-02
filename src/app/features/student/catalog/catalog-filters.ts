import { type CourseQuery } from '../../../core/models/course.model';

/*
 * Los filtros viven en la URL con nombres legibles en español (?progreso=en-curso&orden=titulo),
 * así un enlace se puede compartir y el botón "atrás" funciona. Aquí se traducen, con tipos,
 * a la consulta del API.
 */
export const PROGRESS_FILTERS = {
  'sin-empezar': { label: 'Sin empezar', range: { maxProgress: 0 } },
  'en-curso': { label: 'En curso', range: { minProgress: 1, maxProgress: 99 } },
  completados: { label: 'Completados', range: { minProgress: 100 } },
} as const satisfies Record<string, { label: string; range: Pick<CourseQuery, 'minProgress' | 'maxProgress'> }>;

export const SORT_OPTIONS = {
  recientes: { label: 'Más recientes', sort: { sortBy: 'createdAt', order: 'desc' } },
  titulo: { label: 'Título (A-Z)', sort: { sortBy: 'title', order: 'asc' } },
  progreso: { label: 'Mi progreso', sort: { sortBy: 'progress', order: 'desc' } },
} as const satisfies Record<string, { label: string; sort: Pick<CourseQuery, 'sortBy' | 'order'> }>;

export type ProgressFilter = keyof typeof PROGRESS_FILTERS;
export type SortOption = keyof typeof SORT_OPTIONS;

const isKeyOf = <T extends object>(obj: T, key: unknown): key is keyof T =>
  typeof key === 'string' && Object.hasOwn(obj, key);

export interface CatalogUrlState {
  readonly page?: string;
  readonly q?: string;
  readonly progreso?: string;
  readonly orden?: string;
  readonly mios?: string;
}

export const PAGE_SIZE = 8;

/** URL (strings sin validar) → consulta tipada. Valores desconocidos se ignoran en silencio. */
export function toCourseQuery(state: CatalogUrlState): CourseQuery {
  const page = Number(state.page);
  const progress = isKeyOf(PROGRESS_FILTERS, state.progreso) ? PROGRESS_FILTERS[state.progreso].range : {};
  const sort = isKeyOf(SORT_OPTIONS, state.orden) ? SORT_OPTIONS[state.orden].sort : SORT_OPTIONS.recientes.sort;
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: PAGE_SIZE,
    ...(state.q?.trim() && { title: state.q.trim() }),
    ...(state.mios === '1' && { enrolled: true }),
    ...progress,
    ...sort,
  };
}

export function asProgressFilter(value: string | undefined): ProgressFilter | '' {
  return isKeyOf(PROGRESS_FILTERS, value) ? value : '';
}

export function asSortOption(value: string | undefined): SortOption {
  return isKeyOf(SORT_OPTIONS, value) ? value : 'recientes';
}
