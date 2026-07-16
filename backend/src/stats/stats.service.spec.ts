import { Test, TestingModule } from '@nestjs/testing';
import {
  Language,
  PersonRole,
  PurchaseCondition,
  ReadingState,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;

  const books = [
    {
      id: 'b1',
      userId: 'u1',
      titulo: 'A',
      autores: 'X',
      anio: 1965,
      editorial: 'Akal',
      lengua: Language.es,
      paisEdicion: 'España',
      isbn: '1',
      estado: ReadingState.leido,
      fechaCompra: new Date('2026-01-15T00:00:00.000Z'),
      condicion: PurchaseCondition.nuevo,
      precio: 20,
      moneda: 'EUR',
      puntuacion: 8,
    },
    {
      id: 'b2',
      userId: 'u1',
      titulo: 'B',
      autores: 'Y',
      anio: 1968,
      editorial: 'Akal',
      lengua: Language.fr,
      paisEdicion: 'Francia',
      isbn: '2',
      estado: ReadingState.por_leer,
      fechaCompra: new Date('2026-01-20T00:00:00.000Z'),
      condicion: PurchaseCondition.segunda_mano,
      precio: 10,
      moneda: 'EUR',
      puntuacion: 8,
    },
    {
      id: 'b3',
      userId: 'u1',
      titulo: 'C',
      autores: 'Z',
      anio: 2010,
      editorial: 'Paidós',
      lengua: Language.es,
      paisEdicion: 'España',
      isbn: '3',
      estado: ReadingState.leido,
      fechaCompra: new Date('2026-02-01T00:00:00.000Z'),
      condicion: PurchaseCondition.nuevo,
      precio: 30,
      moneda: 'EUR',
      puntuacion: 9,
    },
  ];

  const prisma: any = {
    book: { findMany: jest.fn() },
    wish: { count: jest.fn() },
    bookPerson: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.book.findMany.mockResolvedValue(books);
    prisma.wish.count.mockResolvedValue(2);
    prisma.bookPerson.findMany.mockResolvedValue([
      {
        role: PersonRole.director,
        person: { nombre: 'Hitchcock' },
      },
      {
        role: PersonRole.director,
        person: { nombre: 'Hitchcock' },
      },
      {
        role: PersonRole.actor,
        person: { nombre: 'Stewart' },
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(StatsService);
  });

  it('aggregates overview stats from fixture', async () => {
    const stats = await service.getOverview('u1');

    expect(stats.totalLibros).toBe(3);
    expect(stats.byLengua.find((r) => r.key === 'es')?.count).toBe(2);
    expect(stats.byLengua.find((r) => r.key === 'es')?.bandera).toBe('ES');
    expect(stats.byDecada.find((r) => r.key === '1960s')?.count).toBe(2);
    expect(stats.byEditorial.find((r) => r.key === 'Akal')?.count).toBe(2);
    expect(stats.byCondicion.find((r) => r.key === 'nuevo')?.count).toBe(2);
    expect(stats.gasto.total).toBe(60);
    expect(stats.gasto.media).toBe(20);
    expect(stats.puntuaciones.media).toBe(8.33);
    expect(stats.puntuaciones.distribution['8']).toBe(2);
    expect(stats.crecimiento).toEqual([
      { periodo: '2026-01', count: 2 },
      { periodo: '2026-02', count: 1 },
    ]);
    expect(stats.figurasPorRol.directores[0]).toEqual({
      nombre: 'Hitchcock',
      count: 2,
    });
    expect(stats.wishlist.abiertos).toBe(2);
  });
});
