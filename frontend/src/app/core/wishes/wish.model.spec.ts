import { Wish, sortWishes, wishPriorityRank } from './wish.model';

const base: Wish = {
  id: 'w1',
  titulo: 'Hitchcock',
  autores: 'Truffaut',
  isbn: '9780306406157',
  lengua: 'es',
  paisEdicion: 'España',
  notas: 'Feria',
  prioridad: 'media',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('wish.model', () => {
  it('sorts by priority then recency', () => {
    const wishes: Wish[] = [
      { ...base, id: 'a', prioridad: 'baja', createdAt: '2026-06-01T00:00:00.000Z' },
      { ...base, id: 'b', prioridad: 'alta', createdAt: '2026-01-01T00:00:00.000Z' },
      { ...base, id: 'c', prioridad: 'alta', createdAt: '2026-07-01T00:00:00.000Z' },
      { ...base, id: 'd', prioridad: 'media', createdAt: '2026-05-01T00:00:00.000Z' },
    ];
    expect(sortWishes(wishes).map((w) => w.id)).toEqual(['c', 'b', 'd', 'a']);
  });

  it('ranks priorities', () => {
    expect(wishPriorityRank('alta')).toBe(0);
    expect(wishPriorityRank('media')).toBe(1);
    expect(wishPriorityRank('baja')).toBe(2);
  });
});
