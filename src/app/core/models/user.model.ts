export type Role = 'admin' | 'student';

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly phone?: string | null;
  readonly createdAt?: string;
}

/** Datos mínimos del usuario autenticado que la app necesita en memoria. */
export type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export interface Session {
  readonly token: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: string;
  readonly user: User;
}

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface RegisterInput extends Credentials {
  readonly name: string;
  readonly phone?: string;
}

/** Resumen de usuario embebido en otras respuestas. */
export type UserRef = Pick<User, 'id' | 'name' | 'email'>;
