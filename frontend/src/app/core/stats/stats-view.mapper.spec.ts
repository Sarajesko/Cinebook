import { mapStatsToView } from './stats-view.mapper';
import { StatsOverview } from './stats.model';

const sample: StatsOverview = {
  totalLibros: 3,
  byLengua: [
    { key: 'es', count: 2, bandera: 'ES' },
    { key: 'fr', count: 1, bandera: 'FR' },
  ],
  byPais: [
    { key: 'España', count: 2 },
    { key: 'Francia', count: 1 },
  ],
  byDecada: [
    { key: '1960s', count: 2 },
    { key: '2010s', count: 1 },
  ],
  byEditorial: [{ key: 'Akal', count: 2 }],
  byEstado: [
    { key: 'leido', count: 2 },
    { key: 'por_leer', count: 1 },
  ],
  byCondicion: [
    { key: 'nuevo', count: 2 },
    { key: 'segunda_mano', count: 1 },
  ],
  gasto: { total: 60, media: 20, moneda: 'EUR', libros: 3 },
  puntuaciones: {
    media: 8.3,
    distribution: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 2,
      '9': 1,
      '10': 0,
    },
    libros: 3,
  },
  crecimiento: [
    { periodo: '2026-01', count: 2 },
    { periodo: '2026-02', count: 1 },
  ],
  timeline: {
    semanas: [{ periodo: '2026-W03', libros: 2, gasto: 40 }],
    meses: [
      { periodo: '2026-01', libros: 2, gasto: 40 },
      { periodo: '2026-02', libros: 1, gasto: 20 },
    ],
    anios: [{ periodo: '2026', libros: 3, gasto: 60 }],
  },
  figurasTop: [{ nombre: 'Hitchcock', role: 'director', count: 2 }],
  figurasPorRol: {
    directores: [{ nombre: 'Hitchcock', count: 2 }],
    directoresFotografia: [],
    guionistas: [],
    actores: [{ nombre: 'Stewart', count: 1 }],
    productores: [],
    bandaSonora: [],
  },
  wishlist: { abiertos: 4 },
};

describe('mapStatsToView', () => {
  it('maps labels, flags and bar widths', () => {
    const view = mapStatsToView(sample);
    expect(view.empty).toBeFalse();
    expect(view.totalLibros).toBe(3);
    expect(view.byLengua[0].bandera).toBe('ES');
    expect(view.byLengua[0].label).toBe('ES');
    expect(view.byEstado[0].label).toBe('Leído');
    expect(view.byCondicion[1].label).toBe('Segunda mano');
    expect(view.byLengua[0].pct).toBe(100);
    expect(view.byLengua[1].pct).toBe(50);
    expect(view.puntuacionMedia).toBe(8.3);
    expect(view.puntuacionLibros).toBe(3);
    expect(view.scoreBars.find((s) => s.score === 8)?.count).toBe(2);
    expect(view.timeline.meses[0].periodo).toBe('2026-01');
    expect(view.timeline.meses[0].libros).toBe(2);
    expect(view.timeline.meses[0].gasto).toBe(40);
    expect(view.figurasTop[0].roleLabel).toBe('Director');
    expect(view.wishlistAbiertos).toBe(4);
    expect(view.gasto.total).toBe(60);
  });

  it('marks empty collections', () => {
    const view = mapStatsToView({
      ...sample,
      totalLibros: 0,
      byLengua: [],
      byPais: [],
      byDecada: [],
      byEditorial: [],
      byEstado: [],
      byCondicion: [],
      gasto: { total: 0, media: 0, moneda: 'EUR', libros: 0 },
      puntuaciones: { media: 0, distribution: {} },
      crecimiento: [],
      figurasTop: [],
      wishlist: { abiertos: 0 },
    });
    expect(view.empty).toBeTrue();
  });
});
