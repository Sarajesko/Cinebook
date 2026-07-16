import { Book } from './book.model';
import {
  EMPTY_FILTERS,
  applyCatalogFilters,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
} from './catalog-filters';

const hitchcock: Book = {
  id: 'b1',
  titulo: 'El cine según Hitchcock',
  autores: 'François Truffaut',
  anio: 1983,
  editorial: 'Alianza',
  lengua: 'es',
  bandera: 'ES',
  paisEdicion: 'España',
  isbn: '9788420674237',
  estado: 'por_leer',
  fechaCompra: '2026-01-01',
  haceCuanto: 'hace 5 meses',
  condicion: 'nuevo',
  precio: 20,
  moneda: 'EUR',
  puntuacion: 9,
  caratula: null,
  notas: null,
  dondeComprado: null,
  directores: ['Alfred Hitchcock'],
  directoresFotografia: [],
  guionistas: [],
  actores: [],
  productores: [],
  bandaSonora: [],
};

const cahiers: Book = {
  ...hitchcock,
  id: 'b2',
  titulo: 'Cahiers du cinéma',
  autores: 'Varios',
  anio: 1965,
  editorial: 'Gallimard',
  lengua: 'fr',
  bandera: 'FR',
  paisEdicion: 'Francia',
  isbn: '9782070123456',
  estado: 'leido',
  condicion: 'segunda_mano',
  puntuacion: 7,
  directores: ['Jean-Luc Godard'],
};

describe('catalog-filters', () => {
  const books = [hitchcock, cahiers];

  it('filters by lengua and país', () => {
    const result = applyCatalogFilters(books, {
      ...EMPTY_FILTERS,
      lengua: 'fr',
      pais: 'Francia',
    });
    expect(result.map((b) => b.id)).toEqual(['b2']);
  });

  it('searches título, autor, editorial, ISBN and figuras', () => {
    expect(applyCatalogFilters(books, { ...EMPTY_FILTERS, q: 'hitchcock' }).length).toBe(1);
    expect(applyCatalogFilters(books, { ...EMPTY_FILTERS, q: 'truffaut' }).length).toBe(1);
    expect(applyCatalogFilters(books, { ...EMPTY_FILTERS, q: '9788420674237' }).length).toBe(1);
    expect(applyCatalogFilters(books, { ...EMPTY_FILTERS, q: 'godard' }).length).toBe(1);
    expect(applyCatalogFilters(books, { ...EMPTY_FILTERS, q: 'alianza' }).length).toBe(1);
    expect(applyCatalogFilters(books, { ...EMPTY_FILTERS, q: 'gallimard' }).length).toBe(1);
  });

  it('filters by estado, condición, puntuación and año', () => {
    const result = applyCatalogFilters(books, {
      ...EMPTY_FILTERS,
      estado: 'leido',
      condicion: 'segunda_mano',
      puntuacion: 7,
      anio: 1965,
    });
    expect(result.map((b) => b.id)).toEqual(['b2']);
  });

  it('filters by autor, editorial and director', () => {
    const result = applyCatalogFilters(books, {
      ...EMPTY_FILTERS,
      autor: 'truffaut',
      editorial: 'alianza',
      director: 'hitchcock',
    });
    expect(result.map((b) => b.id)).toEqual(['b1']);
  });

  it('round-trips query params', () => {
    const filters = {
      ...EMPTY_FILTERS,
      q: 'Hitchcock',
      lengua: 'es' as const,
      puntuacion: 9,
      anio: 1983,
    };
    const params = filtersToParams(filters);
    expect(params).toEqual({
      q: 'Hitchcock',
      lengua: 'es',
      puntuacion: '9',
      anio: '1983',
    });
    expect(filtersFromParams(params)).toEqual(filters);
  });

  it('detects active filters', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBeFalse();
    expect(hasActiveFilters({ ...EMPTY_FILTERS, q: 'x' })).toBeTrue();
  });
});
