import { estadoLabel, flagEmoji } from '../books/book.model';
import {
  StatsBar,
  StatsCountRow,
  StatsOverview,
  StatsScoreBar,
} from './stats.model';

function maxCount(rows: { count: number }[]): number {
  return rows.reduce((m, r) => Math.max(m, r.count), 0);
}

function barWidth(count: number, max: number): number {
  if (!max) return 0;
  return Math.round((count / max) * 1000) / 10;
}

export function conditionStatsLabel(key: string): string {
  return key === 'segunda_mano' ? 'Segunda mano' : key === 'nuevo' ? 'Nuevo' : key;
}

export function figureRoleLabel(role: string): string {
  const map: Record<string, string> = {
    director: 'Director',
    guionista: 'Guionista',
    actor: 'Actor',
    productor: 'Productor',
  };
  return map[role] ?? role;
}

export function toBars(
  rows: StatsCountRow[],
  labelFn: (key: string) => string = (k) => k,
): StatsBar[] {
  const max = maxCount(rows);
  return rows.map((row) => ({
    label: labelFn(row.key),
    count: row.count,
    pct: barWidth(row.count, max),
    flag: row.bandera ? flagEmoji(row.bandera) : undefined,
  }));
}

/** Map API overview → ready-to-render view model */
export function mapStatsToView(data: StatsOverview) {
  const total = data.totalLibros;
  const distEntries = Object.entries(data.puntuaciones.distribution)
    .map(([score, count]) => ({ score: Number(score), count }))
    .sort((a, b) => a.score - b.score);
  const maxScore = maxCount(distEntries);

  const scoreBars: StatsScoreBar[] = distEntries.map((row) => ({
    score: row.score,
    count: row.count,
    pct: barWidth(row.count, maxScore),
  }));

  return {
    totalLibros: total,
    empty: total === 0,
    byLengua: toBars(data.byLengua),
    byPais: toBars(data.byPais),
    byDecada: toBars(data.byDecada),
    byEditorial: toBars(data.byEditorial).slice(0, 8),
    byEstado: toBars(data.byEstado, estadoLabel),
    byCondicion: toBars(data.byCondicion, conditionStatsLabel),
    gasto: data.gasto,
    puntuacionMedia: data.puntuaciones.media,
    scoreBars,
    crecimiento: data.crecimiento.map((row) => ({
      ...row,
      pct: barWidth(row.count, maxCount(data.crecimiento)),
    })),
    figurasTop: data.figurasTop.map((f) => ({
      ...f,
      roleLabel: figureRoleLabel(f.role),
    })),
    figurasPorRol: data.figurasPorRol,
    wishlistAbiertos: data.wishlist.abiertos,
  };
}

export type StatsViewModel = ReturnType<typeof mapStatsToView>;
