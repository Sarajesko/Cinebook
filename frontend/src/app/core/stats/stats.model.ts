export type StatsCountRow = {
  key: string;
  count: number;
  bandera?: string;
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
  };
  crecimiento: { periodo: string; count: number }[];
  figurasTop: { nombre: string; role: string; count: number }[];
  figurasPorRol: {
    directores: { nombre: string; count: number }[];
    guionistas: { nombre: string; count: number }[];
    actores: { nombre: string; count: number }[];
    productores: { nombre: string; count: number }[];
  };
  wishlist: {
    abiertos: number;
  };
};

export type StatsBar = {
  label: string;
  count: number;
  pct: number;
  flag?: string;
};

export type StatsScoreBar = {
  score: number;
  count: number;
  pct: number;
};
