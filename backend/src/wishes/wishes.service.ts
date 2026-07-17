import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReadingState } from '@prisma/client';
import { BooksService } from '../books/books.service';
import { CreateBookDto } from '../books/dto/create-book.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly books: BooksService,
  ) {}

  async create(userId: string, dto: CreateWishDto) {
    const isbn = dto.isbn ? this.normalizeIsbn(dto.isbn) : null;
    const wish = await this.prisma.wish.create({
      data: {
        userId,
        titulo: dto.titulo.trim(),
        autores: dto.autores?.trim() || null,
        isbn,
        lengua: dto.lengua ?? null,
        paisEdicion: dto.paisEdicion?.trim() || null,
        notas: dto.notas?.trim() || null,
        prioridad: dto.prioridad ?? 'media',
      },
    });
    return this.toResponse(wish);
  }

  async findAll(userId: string) {
    const wishes = await this.prisma.wish.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }],
    });
    return wishes.map((w) => this.toResponse(w));
  }

  async findOne(userId: string, id: string) {
    const wish = await this.prisma.wish.findFirst({
      where: { id, userId },
    });
    if (!wish) {
      throw new NotFoundException('Deseado no encontrado');
    }
    return this.toResponse(wish);
  }

  async update(userId: string, id: string, dto: UpdateWishDto) {
    await this.findOne(userId, id);
    const wish = await this.prisma.wish.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.autores !== undefined && {
          autores: dto.autores?.trim() || null,
        }),
        ...(dto.isbn !== undefined && {
          isbn: dto.isbn ? this.normalizeIsbn(dto.isbn) : null,
        }),
        ...(dto.lengua !== undefined && { lengua: dto.lengua }),
        ...(dto.paisEdicion !== undefined && {
          paisEdicion: dto.paisEdicion?.trim() || null,
        }),
        ...(dto.notas !== undefined && { notas: dto.notas?.trim() || null }),
        ...(dto.prioridad !== undefined && { prioridad: dto.prioridad }),
      },
    });
    return this.toResponse(wish);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.wish.delete({ where: { id } });
    return { deleted: true, id };
  }

  /**
   * Convierte deseado → libro (recien_comprado por defecto) y cierra el deseo.
   * Create + delete van en la misma transacción (sin estado a medias).
   */
  async toCollection(userId: string, id: string, dto: CreateBookDto) {
    return this.prisma.$transaction(async (tx) => {
      const wish = await tx.wish.findFirst({
        where: { id, userId },
      });
      if (!wish) {
        throw new NotFoundException('Deseado no encontrado');
      }

      const titulo = (dto.titulo || wish.titulo).trim();
      const autores = (dto.autores || wish.autores || '').trim();
      const isbnRaw = dto.isbn || wish.isbn || '';
      const lengua = dto.lengua ?? wish.lengua;
      const paisEdicion = (dto.paisEdicion || wish.paisEdicion || '').trim();

      if (!autores || !isbnRaw || !lengua) {
        throw new BadRequestException(
          'Completa autores, ISBN y lengua para pasar a colección.',
        );
      }

      const payload: CreateBookDto = {
        ...dto,
        titulo,
        autores,
        isbn: isbnRaw,
        lengua,
        paisEdicion: paisEdicion || null,
        estado: dto.estado ?? ReadingState.recien_comprado,
      };

      const book = await this.books.createInTx(tx, userId, payload);
      await tx.wish.delete({ where: { id } });

      return {
        book,
        closedWishId: id,
        message: 'Deseado pasado a la colección y cerrado.',
      };
    });
  }

  private normalizeIsbn(isbn: string) {
    return isbn.replace(/[-\s]/g, '').trim();
  }

  private toResponse(wish: {
    id: string;
    titulo: string;
    autores: string | null;
    isbn: string | null;
    lengua: string | null;
    paisEdicion: string | null;
    notas: string | null;
    prioridad: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: wish.id,
      titulo: wish.titulo,
      autores: wish.autores,
      isbn: wish.isbn,
      lengua: wish.lengua,
      paisEdicion: wish.paisEdicion,
      notas: wish.notas,
      prioridad: wish.prioridad,
      createdAt: wish.createdAt,
      updatedAt: wish.updatedAt,
    };
  }
}
