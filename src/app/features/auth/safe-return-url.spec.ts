import { safeReturnUrl } from './safe-return-url';

describe('safeReturnUrl', () => {
  it.each([
    ['/cursos/3', '/cursos/3'],
    ['//evil.com', null],
    ['https://evil.com', null],
    ['', null],
    [undefined, null],
  ])('%s => %s', (input, expected) => {
    expect(safeReturnUrl(input)).toBe(expected);
  });
});
