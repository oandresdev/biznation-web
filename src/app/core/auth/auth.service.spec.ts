import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { fakeJwt } from '../../../testing/fake-jwt';
import { type Session } from '../models/user.model';
import { AuthService } from './auth.service';

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;

function session(role: 'admin' | 'student'): Session {
  return {
    token: fakeJwt({ sub: '7', role, exp: inOneHour() }),
    tokenType: 'Bearer',
    expiresIn: '1h',
    user: { id: 7, name: 'Ana', email: 'ana@test.com', role },
  };
}

describe('AuthService', () => {
  let http: HttpTestingController;

  const setup = () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => http.verify());

  it('al iniciar sesión expone el usuario y su página de inicio según el rol', () => {
    const auth = setup();
    auth.login({ email: 'ana@test.com', password: 'x' }).subscribe();
    http.expectOne('/api/v1/auth/login').flush(session('admin'));

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.isAdmin()).toBe(true);
    expect(auth.homeUrl()).toBe('/admin');
    expect(auth.token()).toContain('.');
  });

  it('persiste la sesión y la restaura al recargar', () => {
    setup().login({ email: 'a', password: 'b' }).subscribe();
    http.expectOne('/api/v1/auth/login').flush(session('student'));

    TestBed.resetTestingModule();
    const restored = setup();
    expect(restored.user()?.name).toBe('Ana');
    expect(restored.homeUrl()).toBe('/cursos');
  });

  it('descarta una sesión guardada que ya expiró', () => {
    localStorage.setItem(
      'bn.session',
      JSON.stringify({ token: 't', expiresAt: Date.now() - 1000, user: { id: 1, name: 'A', email: 'a', role: 'student' } }),
    );
    const auth = setup();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('bn.session')).toBeNull();
  });

  it('ignora datos corruptos en el storage', () => {
    localStorage.setItem('bn.session', '{"token": 42}');
    expect(setup().isAuthenticated()).toBe(false);
  });

  it('al cerrar sesión limpia todo y vuelve al login', () => {
    const auth = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    auth.login({ email: 'a', password: 'b' }).subscribe();
    http.expectOne('/api/v1/auth/login').flush(session('student'));

    auth.logout({ reason: 'expired', returnUrl: '/cursos/3' });

    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('bn.session')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { expirada: 1, returnUrl: '/cursos/3' } });
  });
});
