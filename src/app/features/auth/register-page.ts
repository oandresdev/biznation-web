import { Component, computed, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  type TreeValidationResult,
  email,
  form,
  maxLength,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { FieldError } from '../../shared/forms/field-error';
import { serverErrors } from '../../shared/forms/server-errors';
import { AuthFrame } from './auth-frame';

interface RegisterModel {
  name: string;
  email: string;
  password: string;
  phone: string;
}

@Component({
  selector: 'app-register-page',
  imports: [AuthFrame, FormRoot, FormField, FieldError, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './auth-form.scss',
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly model = signal<RegisterModel>({ name: '', email: '', password: '', phone: '' });

  // Las reglas replican las del backend (Zod) para dar feedback inmediato; el backend sigue siendo la autoridad.
  protected readonly registerForm = form(
    this.model,
    (path) => {
      required(path.name, { message: 'Escribe tu nombre' });
      minLength(path.name, 2, { message: 'El nombre debe tener al menos 2 caracteres' });
      required(path.email, { message: 'Escribe tu email' });
      email(path.email, { message: 'Escribe un email válido, como nombre@correo.com' });
      required(path.password, { message: 'Crea una contraseña' });
      minLength(path.password, 8, { message: 'Usa al menos 8 caracteres' });
      maxLength(path.password, 72, { message: 'Usa máximo 72 caracteres' });
      pattern(path.phone, /^\d{8,15}$/, { message: 'Solo números, con indicativo y sin +. Ej.: 573001234567' });
    },
    { submission: { action: () => this.register() } },
  );

  protected readonly formError = computed(
    () => this.registerForm().errors().find((error) => error.kind === 'server')?.message ?? null,
  );

  private async register(): Promise<TreeValidationResult> {
    const { phone, ...rest } = this.model();
    try {
      await firstValueFrom(this.auth.register(phone ? { ...rest, phone } : rest));
      await this.router.navigateByUrl(this.auth.homeUrl());
      return undefined;
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.is('EMAIL_IN_USE')) {
        return [{ kind: 'server', message: 'Ya existe una cuenta con este email. Inicia sesión.', fieldTree: this.registerForm.email }];
      }
      return serverErrors(apiError, {
        name: this.registerForm.name,
        email: this.registerForm.email,
        password: this.registerForm.password,
        phone: this.registerForm.phone,
      });
    }
  }
}
