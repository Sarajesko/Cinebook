export type Book = {
  id: string;
  titulo: string;
  autores: string;
  anio: number;
  editorial: string;
  lengua: 'es' | 'en' | 'fr' | 'pt' | 'ca';
  bandera: 'ES' | 'US/UK' | 'FR' | 'PT' | 'CAT' | string;
  paisEdicion: string | null;
  isbn: string;
  estado: string;
  fechaCompra: string;
  haceCuanto: string;
  condicion: 'nuevo' | 'segunda_mano';
  precio: number | null;
  moneda: string | null;
  puntuacion: number | null;
  caratula: string | null;
  notas: string | null;
  dondeComprado: string | null;
  directores: string[];
  directoresFotografia: string[];
  guionistas: string[];
  actores: string[];
  productores: string[];
  bandaSonora: string[];
  wishMatch?: { id: string; titulo: string } | null;
};

/** Emoji(s) for language bandera codes from the API. */
export function flagEmoji(bandera: string): string {
  switch (bandera) {
    case 'ES':
      return '🇪🇸';
    case 'US/UK':
    case 'USA': // legacy
      return '🇺🇸🇬🇧';
    case 'FR':
      return '🇫🇷';
    case 'PT':
      return '🇵🇹';
    case 'CAT':
      return '🏴󠁥󠁳󠁣󠁴󠁿';
    default:
      return '🏳️';
  }
}

/** Human label for lengua codes (forms / wishlist). */
export function lenguaBandera(lengua: string | null | undefined): string {
  switch (lengua) {
    case 'es':
      return 'ES';
    case 'en':
      return 'US/UK';
    case 'fr':
      return 'FR';
    case 'pt':
      return 'PT';
    case 'ca':
      return 'CAT';
    default:
      return (lengua ?? '').toUpperCase();
  }
}

export function conditionLabel(condicion: string): string {
  return condicion === 'segunda_mano' ? 'Segunda mano' : 'Nuevo';
}

export function estadoLabel(estado: string): string {
  const map: Record<string, string> = {
    por_leer: 'Por leer',
    leyendo: 'Leyendo',
    leido: 'Leído',
    recien_comprado: 'Recién comprado',
  };
  return map[estado] ?? estado;
}

export function starsLabel(puntuacion: number | null | undefined): string {
  if (puntuacion == null) return 'Sin puntuación';
  const n = Math.min(10, Math.max(1, Math.round(puntuacion)));
  return `${'★'.repeat(n)}${'☆'.repeat(10 - n)}`;
}

export function priceLabel(
  precio: number | null | undefined,
  moneda: string | null | undefined,
): string {
  if (precio == null) return 'Sin precio';
  return `${precio} ${moneda || 'EUR'}`;
}
