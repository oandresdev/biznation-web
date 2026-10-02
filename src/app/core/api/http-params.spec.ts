import { toHttpParams } from './http-params';

describe('toHttpParams', () => {
  it('omite valores vacíos y serializa el resto', () => {
    const params = toHttpParams({ page: 2, title: '', status: undefined, enrolled: true, minProgress: 0, q: null });
    expect(params.toString()).toBe('page=2&enrolled=true&minProgress=0');
  });
});
