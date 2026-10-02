import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { type Observable, tap } from 'rxjs';
import { API_URL } from '../api/api-config';
import { type Credentials, type RegisterInput, type Role, type Session } from '../models/user.model';
import { readJwtExpiry } from './jwt';
import { SessionStorage, type StoredSession } from './session-storage';

const HOME_BY_ROLE: Readonly<Record<Role, string>> = {
  admin: '/admin',
  student: '/cursos',
};

/**
 * Fuente única de verdad de la sesión, expuesta como signals de solo lectura.
 * Los componentes leen `user()`, `isAdmin()`... y nunca tocan el storage directamente.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(SessionStorage);
  private readonly apiUrl = inject(API_URL);

  private readonly session = signal<StoredSession | null>(this.restore());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly role = computed(() => this.user()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly homeUrl = computed(() => {
    const role = this.role();
    return role ? HOME_BY_ROLE[role] : '/login';
  });

  constructor() {
    // Cierra la sesión justo cuando expira el token, en vez de esperar al próximo 401.
    effect((onCleanup) => {
      const current = this.session();
      if (!current) return;
      const timer = setTimeout(() => this.logout({ reason: 'expired' }), Math.max(0, current.expiresAt - Date.now()));
      onCleanup(() => clearTimeout(timer));
    });
  }

  token(): string | null {
    return this.session()?.token ?? null;
  }

  login(credentials: Credentials): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/auth/login`, credentials).pipe(tap((s) => this.start(s)));
  }

  register(input: RegisterInput): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/auth/register`, input).pipe(tap((s) => this.start(s)));
  }

  logout(options: { reason?: 'expired' | 'manual'; returnUrl?: string } = {}): void {
    this.storage.clear();
    this.session.set(null);
    const queryParams = {
      ...(options.reason === 'expired' && { expirada: 1 }),
      ...(options.returnUrl && { returnUrl: options.returnUrl }),
    };
    void this.router.navigate(['/login'], { queryParams });
  }

  private start(session: Session): void {
    const { id, name, email, role } = session.user;
    const stored: StoredSession = {
      token: session.token,
      // Si el token no trae exp, se asume la vida por defecto del backend (1 h).
      expiresAt: readJwtExpiry(session.token) ?? Date.now() + 60 * 60 * 1000,
      user: { id, name, email, role },
    };
    this.storage.write(stored);
    this.session.set(stored);
  }

  private restore(): StoredSession | null {
    const stored = this.storage.read();
    if (stored && stored.expiresAt > Date.now()) return stored;
    this.storage.clear();
    return null;
  }
}
