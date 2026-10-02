import { HttpErrorResponse } from '@angular/common/http';

/** Códigos de error que el frontend trata de forma específica (el resto se muestra tal cual). */
export type KnownErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_IN_USE'
  | 'INVALID_TOKEN'
  | 'USER_INACTIVE'
  | 'NOT_ENROLLED'
  | 'COURSE_HAS_PROGRESS'
  | 'COURSE_WITHOUT_LESSONS'
  | 'LESSON_HAS_PROGRESS'
  | 'LAST_LESSON_OF_PUBLISHED_COURSE'
  | 'NOT_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/** `string & {}` conserva el autocompletado de los códigos conocidos sin cerrar el tipo. */
export type ErrorCode = KnownErrorCode | (string & {});

export interface FieldIssue {
  readonly field: string;
  readonly message: string;
}

interface ApiErrorBody {
  readonly error: { readonly code: string; readonly message: string; readonly details?: unknown };
}

/** Error normalizado: los componentes nunca manipulan HttpErrorResponse directamente. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly fieldIssues: readonly FieldIssue[] = [],
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  is(code: KnownErrorCode): boolean {
    return this.code === code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  if (!isRecord(body) || !isRecord(body['error'])) return false;
  const error = body['error'];
  return typeof error['code'] === 'string' && typeof error['message'] === 'string';
}

function isFieldIssue(value: unknown): value is FieldIssue {
  return isRecord(value) && typeof value['field'] === 'string' && typeof value['message'] === 'string';
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return new ApiError(0, 'NETWORK_ERROR', 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.');
    }
    if (isApiErrorBody(error.error)) {
      const { code, message, details } = error.error.error;
      const issues = Array.isArray(details) ? details.filter(isFieldIssue) : [];
      return new ApiError(error.status, code, message, issues, details);
    }
    return new ApiError(error.status, 'UNKNOWN_ERROR', 'El servidor respondió con un error inesperado.');
  }

  return new ApiError(-1, 'UNKNOWN_ERROR', 'Ocurrió un error inesperado.');
}
