export type StatsCountRow = {
  key: string;
  count: number;
  bandera?: string;
};

export type StatsPeriodRow = {
  periodo: string;
  libros: number;
  gasto: number;
};

export type StatsOverview = {
  totalLibros: number;
  byLengua: StatsCountRow[];
  byPais: StatsCountRow[];
  byDecada: StatsCountRow[];
  byEditorial: StatsCountRow[];
  byEstado: StatsCountRow[];
  byCondicion: StatsCountRow[];
  gasto: {
    total: number;
    media: number;
    moneda: string;
    libros: number;
  };
  puntuaciones: {
    media: number;
    distribution: Record<string, number>;
    libros?: number;
  };
  crecimiento: { periodo: string; count: number }[];
  timeline: {
    semanas: StatsPeriodRow[];
    meses: StatsPeriodRow[];
    anios: StatsPeriodRow[];
  };
  figurasTop: { nombre: string; role: string; count: number }[];
  figurasPorRol: {
    directores: { nombre: string; count: number }[];
    directoresFotografia: { nombre: string; count: number }[];
    guionistas: { nombre: string; count: number }[];
    actores: { nombre: string; count: number }[];
    productores: { nombre: string; count: number }[];
    bandaSonora: { nombre: string; count: number }[];
  };
  wishlist: {
    abiertos: number;
  };
};

export type StatsBar = {
  label: string;
  count: number;
  pct: number;
  /** Bandera code for SVG flags (e.g. ES, US/UK, CAT) */
  bandera?: string;
};

export type StatsScoreBar = {
  score: number;
  count: number;
  pct: number;
};
