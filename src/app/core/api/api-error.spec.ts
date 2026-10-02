import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, toApiError } from './api-error';

describe('toApiError', () => {
  it('traduce el formato de error del API, incluidos los errores por campo', () => {
    const error = toApiError(
      new HttpErrorResponse({
        status: 400,
        error: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: [{ field: 'email', message: 'Email inválido' }, 'basura'],
          },
        },
      }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.is('VALIDATION_ERROR')).toBe(true);
    expect(error.fieldIssues).toEqual([{ field: 'email', message: 'Email inválido' }]);
  });

  it('conserva details no estándar (p. ej. COURSE_HAS_PROGRESS)', () => {
    const error = toApiError(
      new HttpErrorResponse({
        status: 409,
        error: { error: { code: 'COURSE_HAS_PROGRESS', message: 'No', details: { studentsWithProgress: 2 } } },
      }),
    );
    expect(error.details).toEqual({ studentsWithProgress: 2 });
    expect(error.fieldIssues).toEqual([]);
  });

  it('distingue la falta de conexión', () => {
    const error = toApiError(new HttpErrorResponse({ status: 0 }));
    expect(error.is('NETWORK_ERROR')).toBe(true);
  });

  it('no se rompe con respuestas que no siguen el contrato', () => {
    expect(toApiError(new HttpErrorResponse({ status: 502, error: '<html>Bad gateway</html>' })).code).toBe('UNKNOWN_ERROR');
    expect(toApiError(new Error('boom')).code).toBe('UNKNOWN_ERROR');
  });
});
