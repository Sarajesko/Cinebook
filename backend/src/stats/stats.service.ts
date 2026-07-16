import { Injectable } from '@nestjs/common';
import { PersonRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const FLAG_BY_LANG: Record<string, string> = {
  es: 'ES',
  en: 'US/UK',
  fr: 'FR',
  pt: 'PT',
  ca: 'CAT',
};

type BookRow = {
  anio: number;
  editorial: string;
  lengua: string;
  paisEdicion: string | null;
  estado: string;
  condicion: string;
  precio: number | null;
  moneda: string | null;
  puntuacion: number | null;
  fechaCompra: Date;
};

export type PeriodStatsRow = {
  periodo: string;
  libros: number;
  gasto: number;
};

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const [books, wishesOpen, peopleLinks] = await Promise.all([
      this.prisma.book.findMany({ where: { userId } }),
      this.prisma.wish.count({ where: { userId } }),
      this.prisma.bookPerson.findMany({
        where: { book: { userId } },
        include: { person: true },
      }),
    ]);

    const total = books.length;
    const byLengua = this.countBy(books, (b) => b.lengua).map((row) => ({
      ...row,
      bandera: FLAG_BY_LANG[row.key] ?? row.key,
    }));
    const byPais = this.countBy(
      books.filter((b) => Boolean(b.paisEdicion?.trim())),
      (b) => b.paisEdicion!.trim(),
    );
    const byDecada = this.countBy(books, (b) => {
      const decade = Math.floor(b.anio / 10) * 10;
      return `${decade}s`;
    });
    const byEditorial = this.countBy(books, (b) => b.editorial);
    const byEstado = this.countBy(books, (b) => b.estado);
    const byCondicion = this.countBy(books, (b) => b.condicion);

    const priced = books.filter((b) => b.precio != null);
    const sumPrecio = priced.reduce((acc, b) => acc + (b.precio as number), 0);
    const gasto = {
      total: round2(sumPrecio),
      media: priced.length ? round2(sumPrecio / priced.length) : 0,
      moneda: priced.find((b) => b.moneda)?.moneda ?? 'EUR',
      libros: priced.length,
    };

    const rated = books.filter((b) => b.puntuacion != null);
    const sumPuntos = rated.reduce(
      (acc, b) => acc + (b.puntuacion as number),
      0,
    );
    const distribution: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) distribution[String(i)] = 0;
    for (const b of rated) {
      distribution[String(b.puntuacion)] += 1;
    }
    const puntuaciones = {
      media: rated.length ? round2(sumPuntos / rated.length) : 0,
      distribution,
      libros: rated.length,
    };

    const timeline = {
      semanas: this.aggregateByPeriod(books, weekKey),
      meses: this.aggregateByPeriod(books, monthKey),
      anios: this.aggregateByPeriod(books, yearKey),
    };

    // Compat: crecimiento = altas por mes
    const crecimiento = timeline.meses.map((row) => ({
      periodo: row.periodo,
      count: row.libros,
    }));

    const figureCount = new Map<
      string,
      { nombre: string; role: string; count: number }
    >();
    for (const link of peopleLinks) {
      const key = `${link.role}:${link.person.nombre}`;
      const prev = figureCount.get(key);
      if (prev) prev.count += 1;
      else
        figureCount.set(key, {
          nombre: link.person.nombre,
          role: link.role,
          count: 1,
        });
    }
    const figurasTop = [...figureCount.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const figurasPorRol = {
      directores: this.topByRole(peopleLinks, PersonRole.director),
      directoresFotografia: this.topByRole(
        peopleLinks,
        PersonRole.director_fotografia,
      ),
      guionistas: this.topByRole(peopleLinks, PersonRole.guionista),
      actores: this.topByRole(peopleLinks, PersonRole.actor),
      productores: this.topByRole(peopleLinks, PersonRole.productor),
      bandaSonora: this.topByRole(peopleLinks, PersonRole.banda_sonora),
    };

    return {
      totalLibros: total,
      byLengua,
      byPais,
      byDecada,
      byEditorial,
      byEstado,
      byCondicion,
      gasto,
      puntuaciones,
      crecimiento,
      timeline,
      figurasTop,
      figurasPorRol,
      wishlist: {
        abiertos: wishesOpen,
      },
    };
  }

  private aggregateByPeriod(
    books: BookRow[],
    keyFn: (d: Date) => string,
  ): PeriodStatsRow[] {
    const map = new Map<string, { libros: number; gasto: number }>();
    for (const b of books) {
      const key = keyFn(new Date(b.fechaCompra));
      const prev = map.get(key) ?? { libros: 0, gasto: 0 };
      prev.libros += 1;
      if (b.precio != null) prev.gasto += b.precio;
      map.set(key, prev);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, row]) => ({
        periodo,
        libros: row.libros,
        gasto: round2(row.gasto),
      }));
  }

  private topByRole(
    links: { role: PersonRole; person: { nombre: string } }[],
    role: PersonRole,
  ) {
    const map = new Map<string, number>();
    for (const link of links) {
      if (link.role !== role) continue;
      map.set(link.person.nombre, (map.get(link.person.nombre) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private countBy<T>(
    items: T[],
    keyFn: (item: T) => string,
  ): { key: string; count: number }[] {
    const map = new Map<string, number>();
    for (const item of items) {
      const key = keyFn(item);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** ISO week key: 2026-W03 */
export function weekKey(d: Date): string {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function yearKey(d: Date): string {
  return String(d.getUTCFullYear());
}
