import { Injectable } from '@nestjs/common';

export type IsbnLookupResult = {
  found: boolean;
  source: 'google' | 'openlibrary' | 'bookcover' | null;
  isbn: string;
  titulo?: string;
  autores?: string;
  anio?: number;
  editorial?: string;
  lengua?: 'es' | 'en' | 'fr' | 'pt' | 'ca';
  paisEdicion?: string;
  caratula?: string;
};

type GoogleVolume = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    language?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

type OpenLibraryBook = {
  title?: string;
  authors?: { name?: string }[];
  publishers?: { name?: string }[];
  publish_date?: string;
  cover?: { large?: string; medium?: string; small?: string };
};

@Injectable()
export class IsbnLookupService {
  async lookup(isbnRaw: string): Promise<IsbnLookupResult> {
    const isbn = isbnRaw.replace(/[^0-9Xx]/g, '').toUpperCase();
    if (isbn.length < 10) {
      return { found: false, source: null, isbn };
    }

    const google = await this.fromGoogle(isbn);
    if (google.found) {
      if (!google.caratula) {
        google.caratula = await this.resolveCover(isbn);
      }
      return google;
    }

    const openLib = await this.fromOpenLibrary(isbn);
    if (openLib.found) {
      if (!openLib.caratula) {
        openLib.caratula = await this.resolveCover(isbn);
      }
      return openLib;
    }

    // Sin ficha: aún intentar solo carátula (Open Library → Bookcover API → Amazon)
    const caratula = await this.resolveCover(isbn);
    if (caratula) {
      return { found: true, source: 'bookcover', isbn, caratula };
    }

    return { found: false, source: null, isbn };
  }

  /** Cadena de portadas: Open Library → Bookcover API → Amazon */
  private async resolveCover(isbn: string): Promise<string | undefined> {
    return (
      (await this.openLibraryCover(isbn)) ??
      (await this.bookcoverApiCover(isbn)) ??
      (await this.amazonCover(isbn))
    );
  }

  private async openLibraryCover(isbn: string): Promise<string | undefined> {
    const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    } catch {
      /* ignore */
    }
    return undefined;
  }

  private async bookcoverApiCover(isbn: string): Promise<string | undefined> {
    try {
      const res = await fetch(
        `https://bookcover.longitood.com/bookcover/${encodeURIComponent(isbn)}`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!res.ok) return undefined;
      const data = (await res.json()) as { url?: string };
      const url = data.url?.trim();
      return url || undefined;
    } catch {
      return undefined;
    }
  }

  private async amazonCover(isbn: string): Promise<string | undefined> {
    const isbn10 = toIsbn10(isbn);
    if (!isbn10) return undefined;
    const url = `https://images-na.ssl-images-amazon.com/images/P/${isbn10}.01.LZZZZZZZ.jpg`;
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      const len = Number(res.headers.get('content-length') ?? 0);
      // Amazon a veces responde 200 con un pixel vacío
      if (res.ok && len > 1000) return url;
    } catch {
      /* ignore */
    }
    return undefined;
  }

  private async fromGoogle(isbn: string): Promise<IsbnLookupResult> {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { found: false, source: null, isbn };

      const data = (await res.json()) as { items?: GoogleVolume[] };
      const info = data.items?.[0]?.volumeInfo;
      if (!info?.title) return { found: false, source: null, isbn };

      const thumb =
        info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
      const caratula = thumb ? thumb.replace(/^http:/i, 'https:') : undefined;

      return {
        found: true,
        source: 'google',
        isbn,
        titulo: info.title.trim(),
        autores: info.authors?.map((a) => a.trim()).filter(Boolean).join(', '),
        anio: yearFrom(info.publishedDate),
        editorial: info.publisher?.trim() || undefined,
        lengua: mapLanguage(info.language),
        paisEdicion: countryFromLanguage(mapLanguage(info.language)),
        caratula,
      };
    } catch {
      return { found: false, source: null, isbn };
    }
  }

  private async fromOpenLibrary(isbn: string): Promise<IsbnLookupResult> {
    try {
      const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&format=json&jscmd=data`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { found: false, source: null, isbn };

      const data = (await res.json()) as Record<string, OpenLibraryBook>;
      const book = data[`ISBN:${isbn}`];
      if (!book?.title) return { found: false, source: null, isbn };

      const caratula =
        book.cover?.large ?? book.cover?.medium ?? book.cover?.small;

      return {
        found: true,
        source: 'openlibrary',
        isbn,
        titulo: book.title.trim(),
        autores: book.authors
          ?.map((a) => a.name?.trim())
          .filter((n): n is string => Boolean(n))
          .join(', '),
        anio: yearFrom(book.publish_date),
        editorial: book.publishers?.[0]?.name?.trim() || undefined,
        ...(caratula ? { caratula } : {}),
      };
    } catch {
      return { found: false, source: null, isbn };
    }
  }
}

function yearFrom(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.match(/(19|20)\d{2}/);
  if (!match) return undefined;
  const year = Number(match[0]);
  return year >= 1000 && year <= 2100 ? year : undefined;
}

function mapLanguage(code?: string): 'es' | 'en' | 'fr' | 'pt' | 'ca' | undefined {
  if (!code) return undefined;
  const base = code.toLowerCase().slice(0, 2);
  if (
    base === 'es' ||
    base === 'en' ||
    base === 'fr' ||
    base === 'pt' ||
    base === 'ca'
  ) {
    return base;
  }
  return undefined;
}

/** Sugerencia débil: lengua ≠ país de edición, pero ayuda al alta. */
function countryFromLanguage(
  lengua?: 'es' | 'en' | 'fr' | 'pt' | 'ca',
): string | undefined {
  switch (lengua) {
    case 'es':
      return 'España';
    case 'ca':
      return 'España';
    case 'fr':
      return 'Francia';
    case 'pt':
      return 'Portugal';
    case 'en':
      return undefined; // US/UK ambiguo
    default:
      return undefined;
  }
}

/** ISBN-13 (978…) → ISBN-10 para portadas Amazon */
export function toIsbn10(isbn: string): string | null {
  const clean = isbn.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (clean.length === 10) return clean;
  if (clean.length !== 13 || !clean.startsWith('978')) return null;
  const core = clean.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (10 - i) * Number(core[i]);
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? 'X' : String(check));
}
