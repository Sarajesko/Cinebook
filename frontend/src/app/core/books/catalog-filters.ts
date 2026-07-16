import { Book } from './book.model';

export type CatalogFilters = {
  q: string;
  lengua: '' | 'es' | 'en' | 'fr' | 'pt';
  pais: string;
  estado: string;
  condicion: '' | 'nuevo' | 'segunda_mano';
  puntuacion: number | null;
  anio: number | null;
  autor: string;
  editorial: string;
  director: string;
  guionista: string;
  actor: string;
  productor: string;
};

export const EMPTY_FILTERS: CatalogFilters = {
  q: '',
  lengua: '',
  pais: '',
  estado: '',
  condicion: '',
  puntuacion: null,
  anio: null,
  autor: '',
  editorial: '',
  director: '',
  guionista: '',
  actor: '',
  productor: '',
};

function includesLoose(haystack: string | null | undefined, needle: string): boolean {
  if (!needle.trim()) return true;
  return (haystack ?? '').toLowerCase().includes(needle.trim().toLowerCase());
}

function namesInclude(names: string[] | undefined, needle: string): boolean {
  if (!needle.trim()) return true;
  const n = needle.trim().toLowerCase();
  return (names ?? []).some((name) => name.toLowerCase().includes(n));
}

export function hasActiveFilters(f: CatalogFilters): boolean {
  return (
    !!f.q.trim() ||
    !!f.lengua ||
    !!f.pais.trim() ||
    !!f.estado ||
    !!f.condicion ||
    f.puntuacion != null ||
    f.anio != null ||
    !!f.autor.trim() ||
    !!f.editorial.trim() ||
    !!f.director.trim() ||
    !!f.guionista.trim() ||
    !!f.actor.trim() ||
    !!f.productor.trim()
  );
}

export function applyCatalogFilters(books: Book[], f: CatalogFilters): Book[] {
  const q = f.q.trim().toLowerCase();

  return books.filter((book) => {
    if (f.lengua && book.lengua !== f.lengua) return false;
    if (f.estado && book.estado !== f.estado) return false;
    if (f.condicion && book.condicion !== f.condicion) return false;
    if (f.puntuacion != null && book.puntuacion !== f.puntuacion) return false;
    if (f.anio != null && book.anio !== f.anio) return false;
    if (!includesLoose(book.paisEdicion, f.pais)) return false;
    if (!includesLoose(book.autores, f.autor)) return false;
    if (!includesLoose(book.editorial, f.editorial)) return false;
    if (!namesInclude(book.directores, f.director)) return false;
    if (!namesInclude(book.guionistas, f.guionista)) return false;
    if (!namesInclude(book.actores, f.actor)) return false;
    if (!namesInclude(book.productores, f.productor)) return false;

    if (!q) return true;

    const haystack = [
      book.titulo,
      book.autores,
      book.isbn,
      ...(book.directores ?? []),
      ...(book.guionistas ?? []),
      ...(book.actores ?? []),
      ...(book.productores ?? []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function filtersFromParams(params: Record<string, string>): CatalogFilters {
  const num = (key: string): number | null => {
    const raw = params[key];
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const lengua = params['lengua'] ?? '';
  const condicion = params['condicion'] ?? '';

  return {
    q: params['q'] ?? '',
    lengua: (['es', 'en', 'fr', 'pt'].includes(lengua)
      ? lengua
      : '') as CatalogFilters['lengua'],
    pais: params['pais'] ?? '',
    estado: params['estado'] ?? '',
    condicion: (condicion === 'nuevo' || condicion === 'segunda_mano'
      ? condicion
      : '') as CatalogFilters['condicion'],
    puntuacion: num('puntuacion'),
    anio: num('anio'),
    autor: params['autor'] ?? '',
    editorial: params['editorial'] ?? '',
    director: params['director'] ?? '',
    guionista: params['guionista'] ?? '',
    actor: params['actor'] ?? '',
    productor: params['productor'] ?? '',
  };
}

export function filtersToParams(f: CatalogFilters): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.q.trim()) out['q'] = f.q.trim();
  if (f.lengua) out['lengua'] = f.lengua;
  if (f.pais.trim()) out['pais'] = f.pais.trim();
  if (f.estado) out['estado'] = f.estado;
  if (f.condicion) out['condicion'] = f.condicion;
  if (f.puntuacion != null) out['puntuacion'] = String(f.puntuacion);
  if (f.anio != null) out['anio'] = String(f.anio);
  if (f.autor.trim()) out['autor'] = f.autor.trim();
  if (f.editorial.trim()) out['editorial'] = f.editorial.trim();
  if (f.director.trim()) out['director'] = f.director.trim();
  if (f.guionista.trim()) out['guionista'] = f.guionista.trim();
  if (f.actor.trim()) out['actor'] = f.actor.trim();
  if (f.productor.trim()) out['productor'] = f.productor.trim();
  return out;
}
