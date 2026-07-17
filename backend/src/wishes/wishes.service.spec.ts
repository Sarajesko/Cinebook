import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Language, ReadingState } from '@prisma/client';
import { BooksService } from '../books/books.service';
import { PrismaService } from '../prisma/prisma.service';
import { WishesService } from './wishes.service';

describe('WishesService', () => {
  let service: WishesService;

  const wishRow = {
    id: 'w1',
    userId: 'u1',
    titulo: 'Hitchcock',
    autores: 'Truffaut',
    isbn: '9781234567890',
    lengua: Language.es,
    paisEdicion: 'España',
    notas: 'feria',
    prioridad: 'alta',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const prisma: any = {
    wish: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(async (fn: (tx: any) => Promise<unknown>) =>
      fn(prisma),
    ),
  };

  const books = {
    createInTx: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishesService,
        { provide: PrismaService, useValue: prisma },
        { provide: BooksService, useValue: books },
      ],
    }).compile();
    service = module.get(WishesService);
  });

  it('creates a wish', async () => {
    prisma.wish.create.mockResolvedValue(wishRow);
    const result = await service.create('u1', {
      titulo: 'Hitchcock',
      autores: 'Truffaut',
      isbn: '978-1234567890',
    });
    expect(result.titulo).toBe('Hitchcock');
    expect(prisma.wish.create).toHaveBeenCalled();
  });

  it('lists wishes', async () => {
    prisma.wish.findMany.mockResolvedValue([wishRow]);
    const list = await service.findAll('u1');
    expect(list).toHaveLength(1);
  });

  it('throws NotFound when missing', async () => {
    prisma.wish.findFirst.mockResolvedValue(null);
    await expect(service.findOne('u1', 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes a wish', async () => {
    prisma.wish.findFirst.mockResolvedValue(wishRow);
    prisma.wish.delete.mockResolvedValue({});
    await expect(service.remove('u1', 'w1')).resolves.toEqual({
      deleted: true,
      id: 'w1',
    });
  });

  it('toCollection creates book and deletes wish in one transaction', async () => {
    prisma.wish.findFirst.mockResolvedValue(wishRow);
    books.createInTx.mockResolvedValue({ id: 'b1', titulo: 'Hitchcock' });
    prisma.wish.delete.mockResolvedValue({});

    const result = await service.toCollection('u1', 'w1', {
      titulo: 'Hitchcock',
      autores: 'Truffaut',
      anio: 1983,
      editorial: 'Akal',
      lengua: Language.es,
      paisEdicion: 'España',
      isbn: '9781234567890',
      estado: ReadingState.recien_comprado,
      fechaCompra: '2026-07-01',
      condicion: 'nuevo' as any,
      precio: 20,
      puntuacion: 8,
    });

    expect(result.closedWishId).toBe('w1');
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(books.createInTx).toHaveBeenCalled();
    expect(prisma.wish.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
  });

  it('toCollection rolls back conceptually if createInTx fails', async () => {
    prisma.wish.findFirst.mockResolvedValue(wishRow);
    books.createInTx.mockRejectedValue(new Error('db fail'));

    await expect(
      service.toCollection('u1', 'w1', {
        titulo: 'Hitchcock',
        autores: 'Truffaut',
        anio: 1983,
        editorial: 'Akal',
        lengua: Language.es,
        paisEdicion: 'España',
        isbn: '9781234567890',
        estado: ReadingState.recien_comprado,
        fechaCompra: '2026-07-01',
        condicion: 'nuevo' as any,
        precio: 20,
        puntuacion: 8,
      }),
    ).rejects.toThrow('db fail');

    expect(prisma.wish.delete).not.toHaveBeenCalled();
  });

  it('toCollection rejects incomplete data', async () => {
    prisma.wish.findFirst.mockResolvedValue({
      ...wishRow,
      autores: null,
      isbn: null,
      lengua: null,
      paisEdicion: null,
    });

    await expect(
      service.toCollection('u1', 'w1', {
        titulo: 'Solo titulo',
        autores: '',
        anio: 2000,
        editorial: 'X',
        lengua: undefined as any,
        paisEdicion: '',
        isbn: '',
        estado: ReadingState.recien_comprado,
        fechaCompra: '2026-01-01',
        condicion: 'nuevo' as any,
        precio: 10,
        puntuacion: 5,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
