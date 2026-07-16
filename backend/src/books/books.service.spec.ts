import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Language,
  PersonRole,
  PurchaseCondition,
  ReadingState,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BooksService } from './books.service';

describe('BooksService', () => {
  let service: BooksService;

  const bookRow = {
    id: 'b1',
    userId: 'u1',
    titulo: 'Hitchcock',
    autores: 'Truffaut',
    anio: 1983,
    editorial: 'Akal',
    lengua: Language.es,
    paisEdicion: 'España',
    isbn: '9781234567890',
    estado: ReadingState.por_leer,
    fechaCompra: new Date('2026-01-10'),
    condicion: PurchaseCondition.nuevo,
    precio: 24.5,
    moneda: 'EUR',
    puntuacion: 9,
    caratula: null,
    notas: null,
    dondeComprado: null,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
    people: [
      {
        role: PersonRole.director,
        person: { nombre: 'Alfred Hitchcock' },
      },
    ],
  };

  const prisma: any = {
    book: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    wish: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    person: {
      upsert: jest.fn(),
    },
    bookPerson: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(async (fn: (tx: any) => Promise<unknown>) =>
      fn(prisma),
    ),
  };

  const baseDto = {
    titulo: 'Hitchcock',
    autores: 'Truffaut',
    anio: 1983,
    editorial: 'Akal',
    lengua: Language.es,
    paisEdicion: 'España',
    isbn: '978-1234567890',
    estado: ReadingState.por_leer,
    fechaCompra: '2026-01-10',
    condicion: PurchaseCondition.nuevo,
    precio: 24.5,
    puntuacion: 9,
    directores: ['Alfred Hitchcock'],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.wish.findFirst.mockResolvedValue(null);
    prisma.wish.findMany.mockResolvedValue([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(BooksService);
  });

  it('creates a book with new fields and flag', async () => {
    prisma.book.findFirst.mockResolvedValue(null);
    prisma.book.create.mockResolvedValue({ id: 'b1' });
    prisma.person.upsert.mockResolvedValue({
      id: 'p1',
      nombre: 'Alfred Hitchcock',
    });
    prisma.bookPerson.create.mockResolvedValue({});
    prisma.book.findUniqueOrThrow.mockResolvedValue(bookRow);

    const result = await service.create('u1', baseDto);

    expect(result.isbn).toBe('9781234567890');
    expect(result.bandera).toBe('ES');
    expect(result.condicion).toBe('nuevo');
    expect(result.precio).toBe(24.5);
    expect(result.puntuacion).toBe(9);
    expect(result.directores).toEqual(['Alfred Hitchcock']);
    expect(result.wishMatch).toBeNull();
  });

  it('rejects duplicate ISBN on create', async () => {
    prisma.book.findFirst.mockResolvedValue({ id: 'other' });
    await expect(service.create('u1', baseDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('checkDuplicate matches by ISBN', async () => {
    prisma.book.findFirst.mockResolvedValue(bookRow);
    const result = await service.checkDuplicate('u1', {
      isbn: '9781234567890',
    });
    expect(result.duplicate).toBe(true);
    expect(result.matchBy).toBe('isbn');
  });

  it('checkDuplicate matches by titulo+autor+editorial', async () => {
    prisma.book.findFirst.mockResolvedValue(null);
    prisma.book.findMany.mockResolvedValue([bookRow]);
    const result = await service.checkDuplicate('u1', {
      titulo: 'hitchcock',
      autores: 'truffaut',
      editorial: 'akal',
    });
    expect(result.duplicate).toBe(true);
    expect(result.matchBy).toBe('titulo_autor_editorial');
  });

  it('checkDuplicate returns false when no match', async () => {
    prisma.book.findFirst.mockResolvedValue(null);
    prisma.book.findMany.mockResolvedValue([bookRow]);
    const result = await service.checkDuplicate('u1', {
      isbn: '9999999999999',
      titulo: 'Otro',
      autores: 'Alguien',
      editorial: 'Otra',
    });
    expect(result.duplicate).toBe(false);
    expect(result.matchBy).toBeNull();
  });

  it('lists only via findMany for user', async () => {
    prisma.book.findMany.mockResolvedValue([bookRow]);
    const list = await service.findAll('u1');
    expect(list).toHaveLength(1);
  });

  it('throws NotFound on missing book', async () => {
    prisma.book.findFirst.mockResolvedValue(null);
    await expect(service.findOne('u1', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deletes an existing book', async () => {
    prisma.book.findFirst.mockResolvedValue(bookRow);
    prisma.book.delete.mockResolvedValue({});
    const result = await service.remove('u1', 'b1');
    expect(result).toEqual({ deleted: true, id: 'b1' });
  });
});
