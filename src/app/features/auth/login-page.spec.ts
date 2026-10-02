import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { fakeJwt } from '../../../testing/fake-jwt';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let http: HttpTestingController;

  async function render() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const type = async (selector: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(selector);
      if (!input) throw new Error(`No existe ${selector}`);
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const submit = async () => {
      el.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
      await fixture.whenStable();
    };
    return { el, type, submit, fixture };
  }

  beforeEach(() => localStorage.clear());

  it('al enviar vacío muestra los errores de cada campo sin llamar al API', async () => {
    const { el, submit } = await render();
    await submit();

    expect(el.textContent).toContain('Escribe tu email');
    expect(el.textContent).toContain('Escribe tu contraseña');
    expect(el.querySelector('#email')?.getAttribute('aria-invalid')).toBe('true');
    http.expectNone('/api/v1/auth/login');
  });

  it('inicia sesión y navega al inicio del rol', async () => {
    const { type, submit } = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    await type('#email', 'admin@biznation.com');
    await type('#password', 'Admin123*');
    await submit();

    const request = http.expectOne('/api/v1/auth/login');
    expect(request.request.body).toEqual({ email: 'admin@biznation.com', password: 'Admin123*' });
    request.flush({
      token: fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 }),
      tokenType: 'Bearer',
      expiresIn: '1h',
      user: { id: 1, name: 'Admin', email: 'admin@biznation.com', role: 'admin' },
    });
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/admin'));
  });

  it('muestra el error del servidor cuando las credenciales no son válidas', async () => {
    const { el, type, submit, fixture } = await render();
    await type('#email', 'ana@test.com');
    await type('#password', 'incorrecta');
    await submit();

    http
      .expectOne('/api/v1/auth/login')
      .flush({ error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' } }, { status: 401, statusText: 'Unauthorized' });

    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(el.querySelector('[role="alert"]')?.textContent).toContain('Credenciales inválidas');
    });
  });
});
