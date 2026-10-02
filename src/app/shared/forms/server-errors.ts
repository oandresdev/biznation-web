import { type ReadonlyFieldTree, type TreeValidationResult } from '@angular/forms/signals';
import { type ApiError } from '../../core/api/api-error';

/**
 * Traduce un ApiError a errores de Signal Forms: los errores de validación del backend se pegan
 * al campo correspondiente y el resto queda como error general del formulario.
 * El mapa de campos es explícito y tipado: sin casts ni acceso por string libre.
 */
export function serverErrors(
  error: ApiError,
  fields: Readonly<Record<string, ReadonlyFieldTree<unknown>>> = {},
): TreeValidationResult {
  const mapped = error.fieldIssues
    .filter((issue) => issue.field in fields)
    .map((issue) => ({ kind: 'server', message: issue.message, fieldTree: fields[issue.field] }));
  return mapped.length ? mapped : [{ kind: 'server', message: error.message }];
}
