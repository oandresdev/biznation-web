/** Evita redirecciones abiertas: solo se aceptan rutas internas ("/algo", nunca "//dominio" ni URLs absolutas). */
export function safeReturnUrl(url: string | undefined): string | null {
  return url && url.startsWith('/') && !url.startsWith('//') ? url : null;
}
