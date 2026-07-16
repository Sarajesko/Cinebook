import { estadoLabel } from '../books/book.model';
import {
  StatsBar,
  StatsCountRow,
  StatsOverview,
  StatsPeriodRow,
  StatsScoreBar,
} from './stats.model';

function maxCount(rows: { count: number }[]): number {
  return rows.reduce((m, r) => Math.max(m, r.count), 0);
}

function maxNum(rows: number[]): number {
  return rows.reduce((m, n) => Math.max(m, n), 0);
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
    director_fotografia: 'Dir. fotografía',
    guionista: 'Guionista',
    actor: 'Actor',
    productor: 'Productor',
    banda_sonora: 'Banda sonora',
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
    bandera: row.bandera,
  }));
}

function lenguaStatsLabel(key: string): string {
  switch (key) {
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
      return key.toUpperCase();
  }
}

function mapPeriodBars(rows: StatsPeriodRow[] | undefined) {
  const list = rows ?? [];
  const maxLibros = maxNum(list.map((r) => r.libros));
  const maxGasto = maxNum(list.map((r) => r.gasto));
  return list.map((row) => ({
    periodo: row.periodo,
    libros: row.libros,
    gasto: row.gasto,
    pctLibros: barWidth(row.libros, maxLibros),
    pctGasto: barWidth(row.gasto, maxGasto),
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

  const timeline = data.timeline ?? {
    semanas: [],
    meses: (data.crecimiento ?? []).map((r) => ({
      periodo: r.periodo,
      libros: r.count,
      gasto: 0,
    })),
    anios: [],
  };

  return {
    totalLibros: total,
    empty: total === 0,
    byLengua: toBars(data.byLengua, lenguaStatsLabel),
    byPais: toBars(data.byPais),
    byDecada: toBars(data.byDecada),
    byEditorial: toBars(data.byEditorial),
    byEstado: toBars(data.byEstado, estadoLabel),
    byCondicion: toBars(data.byCondicion, conditionStatsLabel),
    gasto: data.gasto,
    puntuacionMedia: data.puntuaciones.media,
    puntuacionLibros: data.puntuaciones.libros ?? 0,
    scoreBars,
    timeline: {
      semanas: mapPeriodBars(timeline.semanas),
      meses: mapPeriodBars(timeline.meses),
      anios: mapPeriodBars(timeline.anios),
    },
    figurasTop: data.figurasTop.map((f) => ({
      ...f,
      roleLabel: figureRoleLabel(f.role),
    })),
    figurasPorRol: data.figurasPorRol,
    wishlistAbiertos: data.wishlist.abiertos,
  };
}

export type StatsViewModel = ReturnType<typeof mapStatsToView>;
export type StatsPeriodGrain = 'semanas' | 'meses' | 'anios';
