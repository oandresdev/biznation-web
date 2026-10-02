import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { Brand } from './brand';

interface NavItem {
  readonly label: string;
  readonly link: string;
  readonly exact?: boolean;
}

const STUDENT_NAV: readonly NavItem[] = [
  { label: 'Cursos', link: '/cursos' },
  { label: 'Mi progreso', link: '/mi-progreso' },
];

const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Resumen', link: '/admin', exact: true },
  { label: 'Cursos', link: '/admin/cursos' },
  { label: 'Estudiantes', link: '/admin/estudiantes' },
  { label: 'WhatsApp', link: '/admin/mensajes' },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Brand],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly nav = computed(() => (this.auth.isAdmin() ? ADMIN_NAV : STUDENT_NAV));
  protected readonly initials = computed(() =>
    (this.auth.user()?.name ?? '')
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
  );

  protected logout(): void {
    this.auth.logout({ reason: 'manual' });
  }
}
