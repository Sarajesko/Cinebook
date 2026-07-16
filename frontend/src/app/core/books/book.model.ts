export type Book = {
  id: string;
  titulo: string;
  autores: string;
  anio: number;
  editorial: string;
  lengua: 'es' | 'en' | 'fr' | 'pt';
  bandera: 'ES' | 'USA' | 'FR' | 'PT' | string;
  paisEdicion: string;
  isbn: string;
  estado: string;
  fechaCompra: string;
  haceCuanto: string;
  condicion: 'nuevo' | 'segunda_mano';
  precio: number;
  moneda: string;
  puntuacion: number;
  caratula: string | null;
  notas: string | null;
  dondeComprado: string | null;
  directores: string[];
  guionistas: string[];
  actores: string[];
  productores: string[];
  wishMatch?: { id: string; titulo: string } | null;
};

export function flagEmoji(bandera: string): string {
  switch (bandera) {
    case 'ES':
      return '🇪🇸';
    case 'USA':
      return '🇺🇸';
    case 'FR':
      return '🇫🇷';
    case 'PT':
      return '🇵🇹';
    default:
      return '🏳️';
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

export function starsLabel(puntuacion: number): string {
  const n = Math.min(10, Math.max(1, Math.round(puntuacion)));
  return `${'★'.repeat(n)}${'☆'.repeat(10 - n)}`;
}
