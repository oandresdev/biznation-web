/** JWT sin firma válida, solo para tests: el frontend nunca verifica firmas, solo lee `exp`. */
export const fakeJwt = (payload: Record<string, unknown>): string =>
  ['e30', btoa(JSON.stringify(payload)).replace(/=+$/, ''), 'firma'].join('.');
