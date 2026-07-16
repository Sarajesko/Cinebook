import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PersonRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckDuplicateDto } from './dto/check-duplicate.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { IsbnLookupService } from './isbn-lookup.service';

const bookInclude = {
  people: {
    include: { person: true },
  },
} satisfies Prisma.BookInclude;

type BookWithPeople = Prisma.BookGetPayload<{ include: typeof bookInclude }>;

const FLAG_BY_LANG: Record<string, string> = {
  es: 'ES',
  en: 'US/UK',
  fr: 'FR',
  pt: 'PT',
  ca: 'CAT',
};

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly isbnLookup: IsbnLookupService,
  ) {}

  lookupIsbn(isbn: string) {
    return this.isbnLookup.lookup(this.normalizeIsbn(isbn));
  }

  async create(userId: string, dto: CreateBookDto) {
    const isbn = this.normalizeIsbn(dto.isbn);
    await this.assertIsbnFree(userId, isbn);

    const book = await this.prisma.$transaction(async (tx) => {
      const created = await tx.book.create({
        data: {
          userId,
          titulo: dto.titulo.trim(),
          autores: dto.autores.trim(),
          anio: dto.anio,
          editorial: dto.editorial.trim(),
          lengua: dto.lengua,
          paisEdicion: dto.paisEdicion?.trim() || null,
          isbn,
          estado: dto.estado,
          fechaCompra: new Date(dto.fechaCompra),
          condicion: dto.condicion,
          precio: dto.precio ?? null,
          moneda: this.resolveMoneda(dto.moneda, dto.precio),
          puntuacion: dto.puntuacion ?? null,
          caratula: dto.caratula?.trim() || null,
          notas: dto.notas?.trim() || null,
          dondeComprado: dto.dondeComprado?.trim() || null,
        },
      });

      await this.syncPeople(tx, userId, created.id, dto);
      return tx.book.findUniqueOrThrow({
        where: { id: created.id },
        include: bookInclude,
      });
    });

    const wishMatch = await this.findWishMatch(userId, isbn, dto.titulo);
    return {
      ...this.toResponse(book),
      wishMatch,
    };
  }

  async findAll(userId: string) {
    const books = await this.prisma.book.findMany({
      where: { userId },
      include: bookInclude,
      orderBy: { fechaCompra: 'desc' },
    });
    return books.map((b) => this.toResponse(b));
  }

  async findOne(userId: string, id: string) {
    const book = await this.prisma.book.findFirst({
      where: { id, userId },
      include: bookInclude,
    });
    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }
    return this.toResponse(book);
  }

  async update(userId: string, id: string, dto: UpdateBookDto) {
    await this.findOne(userId, id);

    if (dto.isbn) {
      const isbn = this.normalizeIsbn(dto.isbn);
      await this.assertIsbnFree(userId, isbn, id);
    }

    const book = await this.prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id },
        data: {
          ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
          ...(dto.autores !== undefined && { autores: dto.autores.trim() }),
          ...(dto.anio !== undefined && { anio: dto.anio }),
          ...(dto.editorial !== undefined && {
            editorial: dto.editorial.trim(),
          }),
          ...(dto.lengua !== undefined && { lengua: dto.lengua }),
          ...(dto.paisEdicion !== undefined && {
            paisEdicion: dto.paisEdicion?.trim() || null,
          }),
          ...(dto.isbn !== undefined && {
            isbn: this.normalizeIsbn(dto.isbn),
          }),
          ...(dto.estado !== undefined && { estado: dto.estado }),
          ...(dto.fechaCompra !== undefined && {
            fechaCompra: new Date(dto.fechaCompra),
          }),
          ...(dto.condicion !== undefined && { condicion: dto.condicion }),
          ...(dto.precio !== undefined && { precio: dto.precio }),
          ...(dto.moneda !== undefined && {
            moneda: dto.moneda?.trim()
              ? dto.moneda.trim().toUpperCase()
              : null,
          }),
          ...(dto.puntuacion !== undefined && { puntuacion: dto.puntuacion }),
          ...(dto.caratula !== undefined && {
            caratula: dto.caratula?.trim() || null,
          }),
          ...(dto.notas !== undefined && { notas: dto.notas?.trim() || null }),
          ...(dto.dondeComprado !== undefined && {
            dondeComprado: dto.dondeComprado?.trim() || null,
          }),
        },
      });

      if (
        dto.directores !== undefined ||
        dto.directoresFotografia !== undefined ||
        dto.guionistas !== undefined ||
        dto.actores !== undefined ||
        dto.productores !== undefined ||
        dto.bandaSonora !== undefined
      ) {
        await this.syncPeople(tx, userId, id, {
          directores: dto.directores,
          directoresFotografia: dto.directoresFotografia,
          guionistas: dto.guionistas,
          actores: dto.actores,
          productores: dto.productores,
          bandaSonora: dto.bandaSonora,
        });
      }

      return tx.book.findUniqueOrThrow({
        where: { id },
        include: bookInclude,
      });
    });

    return this.toResponse(book);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.book.delete({ where: { id } });
    return { deleted: true, id };
  }

  /**
   * Aviso no bloqueante: ISBN primero; si no, título+autor+editorial.
   * También indica si hay match en wishlist.
   */
  async checkDuplicate(userId: string, dto: CheckDuplicateDto) {
    const exclude = dto.excludeBookId;

    if (dto.isbn) {
      const isbn = this.normalizeIsbn(dto.isbn);
      const byIsbn = await this.prisma.book.findFirst({
        where: {
          userId,
          isbn,
          ...(exclude ? { NOT: { id: exclude } } : {}),
        },
        include: bookInclude,
      });
      if (byIsbn) {
        const wish = await this.findWishMatch(userId, isbn, dto.titulo);
        return {
          duplicate: true,
          matchBy: 'isbn' as const,
          message: `¿Ya tienes este? Coincidencia por ISBN (${byIsbn.titulo}).`,
          book: this.toResponse(byIsbn),
          wishMatch: wish,
        };
      }
    }

    if (dto.titulo && dto.autores && dto.editorial) {
      const books = await this.prisma.book.findMany({
        where: {
          userId,
          ...(exclude ? { NOT: { id: exclude } } : {}),
        },
        include: bookInclude,
      });
      const t = this.normText(dto.titulo);
      const a = this.normText(dto.autores);
      const e = this.normText(dto.editorial);
      const byMeta = books.find(
        (b) =>
          this.normText(b.titulo) === t &&
          this.normText(b.autores) === a &&
          this.normText(b.editorial) === e,
      );
      if (byMeta) {
        const wish = await this.findWishMatch(
          userId,
          dto.isbn ? this.normalizeIsbn(dto.isbn) : undefined,
          dto.titulo,
        );
        return {
          duplicate: true,
          matchBy: 'titulo_autor_editorial' as const,
          message: `¿Ya tienes este? Parece el mismo título/autor/editorial (${byMeta.titulo}).`,
          book: this.toResponse(byMeta),
          wishMatch: wish,
        };
      }
    }

    const wish = await this.findWishMatch(
      userId,
      dto.isbn ? this.normalizeIsbn(dto.isbn) : undefined,
      dto.titulo,
    );

    return {
      duplicate: false,
      matchBy: null,
      message: null,
      book: null,
      wishMatch: wish,
    };
  }

  private async findWishMatch(
    userId: string,
    isbn?: string,
    titulo?: string,
  ) {
    if (isbn) {
      const byIsbn = await this.prisma.wish.findFirst({
        where: { userId, isbn },
      });
      if (byIsbn) {
        return {
          id: byIsbn.id,
          titulo: byIsbn.titulo,
          isbn: byIsbn.isbn,
          matchedBy: 'isbn' as const,
        };
      }
    }
    if (titulo) {
      const wishes = await this.prisma.wish.findMany({ where: { userId } });
      const t = this.normText(titulo);
      const byTitle = wishes.find((w) => this.normText(w.titulo) === t);
      if (byTitle) {
        return {
          id: byTitle.id,
          titulo: byTitle.titulo,
          isbn: byTitle.isbn,
          matchedBy: 'titulo' as const,
        };
      }
    }
    return null;
  }

  private normalizeIsbn(isbn: string) {
    return isbn.replace(/[-\s]/g, '').trim();
  }

  private normText(value: string) {
    return value
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .trim();
  }

  private async assertIsbnFree(
    userId: string,
    isbn: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.book.findFirst({
      where: {
        userId,
        isbn,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictException('Ya tienes un libro con ese ISBN');
    }
  }

  private async syncPeople(
    tx: Prisma.TransactionClient,
    userId: string,
    bookId: string,
    figures: {
      directores?: string[];
      directoresFotografia?: string[];
      guionistas?: string[];
      actores?: string[];
      productores?: string[];
      bandaSonora?: string[];
    },
  ) {
    const roleMap: { role: PersonRole; names?: string[] }[] = [
      { role: PersonRole.director, names: figures.directores },
      {
        role: PersonRole.director_fotografia,
        names: figures.directoresFotografia,
      },
      { role: PersonRole.guionista, names: figures.guionistas },
      { role: PersonRole.actor, names: figures.actores },
      { role: PersonRole.productor, names: figures.productores },
      { role: PersonRole.banda_sonora, names: figures.bandaSonora },
    ];

    const rolesToReplace = roleMap
      .filter((r) => r.names !== undefined)
      .map((r) => r.role);

    if (rolesToReplace.length) {
      await tx.bookPerson.deleteMany({
        where: { bookId, role: { in: rolesToReplace } },
      });
    }

    for (const { role, names } of roleMap) {
      if (!names) continue;
      const unique = [
        ...new Set(names.map((n) => n.trim()).filter(Boolean)),
      ];
      for (const nombre of unique) {
        const person = await tx.person.upsert({
          where: { userId_nombre: { userId, nombre } },
          create: { userId, nombre },
          update: {},
        });
        await tx.bookPerson.create({
          data: { bookId, personId: person.id, role },
        });
      }
    }
  }

  private toResponse(book: BookWithPeople) {
    const byRole = (role: PersonRole) =>
      book.people
        .filter((p) => p.role === role)
        .map((p) => p.person.nombre);

    return {
      id: book.id,
      titulo: book.titulo,
      autores: book.autores,
      anio: book.anio,
      editorial: book.editorial,
      lengua: book.lengua,
      bandera: FLAG_BY_LANG[book.lengua] ?? book.lengua,
      paisEdicion: book.paisEdicion,
      isbn: book.isbn,
      estado: book.estado,
      fechaCompra: book.fechaCompra,
      haceCuanto: this.relativeFrom(book.fechaCompra),
      condicion: book.condicion,
      precio: book.precio,
      moneda: book.moneda,
      puntuacion: book.puntuacion,
      caratula: book.caratula,
      notas: book.notas,
      dondeComprado: book.dondeComprado,
      directores: byRole(PersonRole.director),
      directoresFotografia: byRole(PersonRole.director_fotografia),
      guionistas: byRole(PersonRole.guionista),
      actores: byRole(PersonRole.actor),
      productores: byRole(PersonRole.productor),
      bandaSonora: byRole(PersonRole.banda_sonora),
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  private resolveMoneda(
    moneda: string | null | undefined,
    precio: number | null | undefined,
  ): string | null {
    const trimmed = moneda?.trim();
    if (trimmed) return trimmed.toUpperCase();
    if (precio != null) return 'EUR';
    return null;
  }

  private relativeFrom(date: Date) {
    const ms = Date.now() - date.getTime();
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days < 1) return 'hoy';
    if (days === 1) return 'hace 1 día';
    if (days < 30) return `hace ${days} días`;
    const months = Math.floor(days / 30);
    if (months === 1) return 'hace 1 mes';
    if (months < 12) return `hace ${months} meses`;
    const years = Math.floor(months / 12);
    if (years === 1) return 'hace 1 año';
    return `hace ${years} años`;
  }
}
