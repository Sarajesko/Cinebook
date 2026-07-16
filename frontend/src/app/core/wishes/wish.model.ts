export type Wish = {
  id: string;
  titulo: string;
  autores: string | null;
  isbn: string | null;
  lengua: 'es' | 'en' | 'fr' | 'pt' | 'ca' | null;
  paisEdicion: string | null;
  notas: string | null;
  prioridad: 'alta' | 'media' | 'baja' | string | null;
  createdAt: string;
  updatedAt: string;
};

export type WishWritePayload = {
  titulo: string;
  autores?: string;
  isbn?: string;
  lengua?: 'es' | 'en' | 'fr' | 'pt' | 'ca';
  paisEdicion?: string;
  notas?: string;
  prioridad?: 'alta' | 'media' | 'baja';
};

export function wishPriorityLabel(prioridad: string | null | undefined): string {
  switch (prioridad) {
    case 'alta':
      return 'Alta';
    case 'baja':
      return 'Baja';
    default:
      return 'Media';
  }
}

export function wishPriorityRank(prioridad: string | null | undefined): number {
  switch (prioridad) {
    case 'alta':
      return 0;
    case 'baja':
      return 2;
    default:
      return 1;
  }
}

export function sortWishes(wishes: Wish[]): Wish[] {
  return [...wishes].sort((a, b) => {
    const pr = wishPriorityRank(a.prioridad) - wishPriorityRank(b.prioridad);
    if (pr !== 0) return pr;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function wishLenguaFlag(lengua: string | null | undefined): string {
  switch (lengua) {
    case 'es':
      return '🇪🇸';
    case 'en':
      return '🇺🇸🇬🇧';
    case 'fr':
      return '🇫🇷';
    case 'pt':
      return '🇵🇹';
    case 'ca':
      return '🏴󠁥󠁳󠁣󠁴󠁿';
    default:
      return '';
  }
}
