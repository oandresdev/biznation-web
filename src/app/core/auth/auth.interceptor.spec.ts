import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { authInterceptor, unauthorizedInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('interceptores de autenticación', () => {
  const logout = vi.fn();
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    logout.mockReset();
    const fakeAuth: Pick<AuthService, 'token' | 'isAuthenticated' | 'logout'> = {
      token: () => 'token-de-prueba',
      isAuthenticated: signal(true).asReadonly(),
      logout,
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor, unauthorizedInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: fakeAuth },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('agrega el Bearer solo a peticiones hacia nuestro API', () => {
    http.get('/api/v1/courses').subscribe();
    http.get('https://otro-dominio.com/datos').subscribe();

    expect(backend.expectOne('/api/v1/courses').request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    expect(backend.expectOne('https://otro-dominio.com/datos').request.headers.has('Authorization')).toBe(false);
  });

  it('cierra la sesión ante un 401 en una ruta protegida', () => {
    http.get('/api/v1/courses').subscribe({ error: () => undefined });
    backend.expectOne('/api/v1/courses').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(logout).toHaveBeenCalledWith(expect.objectContaining({ reason: 'expired' }));
  });

  it('no cierra la sesión por un 401 del login (son credenciales erradas)', () => {
    http.post('/api/v1/auth/login', {}).subscribe({ error: () => undefined });
    backend.expectOne('/api/v1/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(logout).not.toHaveBeenCalled();
  });
});
