import { fakeJwt } from '../../../testing/fake-jwt';
import { readJwtExpiry } from './jwt';

describe('readJwtExpiry', () => {
  it('devuelve exp en milisegundos', () => {
    expect(readJwtExpiry(fakeJwt({ exp: 1_800_000_000 }))).toBe(1_800_000_000_000);
  });

  it('devuelve null con tokens malformados o sin exp', () => {
    expect(readJwtExpiry('no-es-un-jwt')).toBeNull();
    expect(readJwtExpiry('a.@@@.c')).toBeNull();
    expect(readJwtExpiry(fakeJwt({ sub: '1' }))).toBeNull();
  });
});
