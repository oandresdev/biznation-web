import { Injectable } from '@angular/core';
import { type SessionUser } from '../models/user.model';

export interface StoredSession {
  readonly token: string;
  readonly expiresAt: number;
  readonly user: SessionUser;
}

const KEY = 'bn.session';

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const user = v['user'] as Record<string, unknown> | undefined;
  return (
    typeof v['token'] === 'string' &&
    typeof v['expiresAt'] === 'number' &&
    typeof user === 'object' &&
    (user['role'] === 'admin' || user['role'] === 'student')
  );
}

/**
 * Persistencia de la sesión. Decisión consciente: localStorage es simple y sobrevive a recargas,
 * pero es legible por JavaScript (riesgo ante XSS). La alternativa más segura es una cookie
 * httpOnly emitida por el backend; queda documentada como mejora.
 */
@Injectable({ providedIn: 'root' })
export class SessionStorage {
  read(): StoredSession | null {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return isStoredSession(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  write(session: StoredSession): void {
    localStorage.setItem(KEY, JSON.stringify(session));
  }

  clear(): void {
    localStorage.removeItem(KEY);
  }
}
