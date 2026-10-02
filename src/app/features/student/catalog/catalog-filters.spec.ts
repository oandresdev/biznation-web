import { PAGE_SIZE, toCourseQuery } from './catalog-filters';

describe('toCourseQuery', () => {
  it('usa valores por defecto sin filtros', () => {
    expect(toCourseQuery({})).toEqual({ page: 1, limit: PAGE_SIZE, sortBy: 'createdAt', order: 'desc' });
  });

  it('traduce los filtros legibles de la URL a la consulta del API', () => {
    expect(toCourseQuery({ page: '3', q: '  marketing ', progreso: 'en-curso', orden: 'titulo', mios: '1' })).toEqual({
      page: 3,
      limit: PAGE_SIZE,
      title: 'marketing',
      enrolled: true,
      minProgress: 1,
      maxProgress: 99,
      sortBy: 'title',
      order: 'asc',
    });
  });

  it('ignora valores inválidos o manipulados en la URL', () => {
    const query = toCourseQuery({ page: '-4', progreso: 'toString', orden: '__proto__' });
    expect(query.page).toBe(1);
    expect(query.minProgress).toBeUndefined();
    expect(query.sortBy).toBe('createdAt');
  });
});
