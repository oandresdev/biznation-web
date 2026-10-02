/** Lee el `exp` (en ms) de un JWT sin validarlo: la validación real la hace el backend. */
export function readJwtExpiry(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp: unknown = (JSON.parse(json) as Record<string, unknown>)['exp'];
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}
