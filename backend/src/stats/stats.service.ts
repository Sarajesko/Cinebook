import { Injectable } from '@nestjs/common';
import { PersonRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const FLAG_BY_LANG: Record<string, string> = {
  es: 'ES',
  en: 'USA',
  fr: 'FR',
  pt: 'PT',
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
    const byPais = this.countBy(books, (b) => b.paisEdicion);
    const byDecada = this.countBy(books, (b) => {
      const decade = Math.floor(b.anio / 10) * 10;
      return `${decade}s`;
    });
    const byEditorial = this.countBy(books, (b) => b.editorial);
    const byEstado = this.countBy(books, (b) => b.estado);
    const byCondicion = this.countBy(books, (b) => b.condicion);

    const sumPrecio = books.reduce((acc, b) => acc + b.precio, 0);
    const gasto = {
      total: round2(sumPrecio),
      media: total ? round2(sumPrecio / total) : 0,
      moneda: books[0]?.moneda ?? 'EUR',
      libros: total,
    };

    const sumPuntos = books.reduce((acc, b) => acc + b.puntuacion, 0);
    const distribution: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) distribution[String(i)] = 0;
    for (const b of books) {
      distribution[String(b.puntuacion)] += 1;
    }
    const puntuaciones = {
      media: total ? round2(sumPuntos / total) : 0,
      distribution,
    };

    const growthMap = new Map<string, number>();
    for (const b of books) {
      const d = new Date(b.fechaCompra);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      growthMap.set(key, (growthMap.get(key) ?? 0) + 1);
    }
    const crecimiento = [...growthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, count]) => ({ periodo, count }));

    const figureCount = new Map<string, { nombre: string; role: string; count: number }>();
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
      guionistas: this.topByRole(peopleLinks, PersonRole.guionista),
      actores: this.topByRole(peopleLinks, PersonRole.actor),
      productores: this.topByRole(peopleLinks, PersonRole.productor),
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
      figurasTop,
      figurasPorRol,
      wishlist: {
        abiertos: wishesOpen,
      },
    };
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
