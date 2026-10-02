import { Component, computed, inject, input, signal } from '@angular/core';
import { FormField, FormRoot, type TreeValidationResult, email, form, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { type Credentials } from '../../core/models/user.model';
import { FieldError } from '../../shared/forms/field-error';
import { serverErrors } from '../../shared/forms/server-errors';
import { AuthFrame } from './auth-frame';
import { safeReturnUrl } from './safe-return-url';

/** Cuentas del seed del backend, para recorrer la demo sin escribir credenciales. */
const DEMO_ACCOUNTS: readonly (Credentials & { readonly label: string })[] = [
  { label: 'Administrador', email: 'admin@biznation.com', password: 'Admin123*' },
  { label: 'Estudiante', email: 'ana@biznation.com', password: 'Student123*' },
];

@Component({
  selector: 'app-login-page',
  imports: [AuthFrame, FormRoot, FormField, FieldError, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './auth-form.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Query params enlazados como inputs (withComponentInputBinding). */
  readonly returnUrl = input<string>();
  readonly expirada = input<string>();

  protected readonly demoAccounts = DEMO_ACCOUNTS;
  protected readonly model = signal<Credentials>({ email: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.email, { message: 'Escribe tu email' });
      email(path.email, { message: 'Escribe un email válido, como nombre@correo.com' });
      required(path.password, { message: 'Escribe tu contraseña' });
    },
    { submission: { action: () => this.login() } },
  );

  protected readonly formError = computed(
    () => this.loginForm().errors().find((error) => error.kind === 'server')?.message ?? null,
  );

  protected useDemo(account: Credentials): void {
    this.model.set({ email: account.email, password: account.password });
  }

  private async login(): Promise<TreeValidationResult> {
    try {
      await firstValueFrom(this.auth.login(this.model()));
      await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()) ?? this.auth.homeUrl());
      return undefined;
    } catch (error) {
      return serverErrors(toApiError(error));
    }
  }
}
