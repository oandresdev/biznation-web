import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import {
  type PartialMatchRouteSnapshot,
  type Route,
  UrlSegment,
  type UrlTree,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { type Role } from '../models/user.model';
import { authGuard, roleGuard } from './auth.guards';
import { AuthService } from './auth.service';

function setup(role: Role | null) {
  const fakeAuth: Pick<AuthService, 'isAuthenticated' | 'role' | 'homeUrl'> = {
    isAuthenticated: signal(role !== null).asReadonly(),
    role: signal(role).asReadonly(),
    homeUrl: signal(role === 'admin' ? '/admin' : '/cursos').asReadonly(),
  };
  TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: fakeAuth }] });
}

const route: Route = {};

/** Snapshot parcial completo y tipado, como el que construye el router (sin casts). */
function snapshot(url: UrlSegment[]): PartialMatchRouteSnapshot {
  return {
    routeConfig: route,
    url,
    params: {},
    queryParams: {},
    fragment: null,
    data: {},
    outlet: 'primary',
    title: undefined,
    paramMap: convertToParamMap({}),
    queryParamMap: convertToParamMap({}),
  };
}

const run = (guard: typeof authGuard, path = 'admin') => {
  const segments = [new UrlSegment(path, {})];
  return TestBed.runInInjectionContext(() => guard(route, segments, snapshot(segments)));
};

describe('guards', () => {
  it('authGuard manda al login con la URL de retorno', () => {
    setup(null);
    expect(String(run(authGuard, 'mi-progreso') as UrlTree)).toBe('/login?returnUrl=%2Fmi-progreso');
  });

  it('roleGuard deja pasar el rol correcto', () => {
    setup('admin');
    expect(run(roleGuard('admin'))).toBe(true);
  });

  it('roleGuard redirige a un estudiante a su propio inicio', () => {
    setup('student');
    expect(String(run(roleGuard('admin')) as UrlTree)).toBe('/cursos');
  });
});
