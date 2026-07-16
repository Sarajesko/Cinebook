import { Test, TestingModule } from '@nestjs/testing';
import { IsbnLookupService } from './isbn-lookup.service';

describe('IsbnLookupService', () => {
  let service: IsbnLookupService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IsbnLookupService],
    }).compile();
    service = module.get(IsbnLookupService);
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('returns Google Books metadata when found', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            volumeInfo: {
              title: 'Hitchcock',
              authors: ['François Truffaut'],
              publisher: 'Alianza',
              publishedDate: '1983',
              language: 'es',
              imageLinks: { thumbnail: 'http://example.com/c.jpg' },
            },
          },
        ],
      }),
    } as Response);

    const result = await service.lookup('9788420674237');

    expect(result.found).toBe(true);
    expect(result.source).toBe('google');
    expect(result.titulo).toBe('Hitchcock');
    expect(result.autores).toBe('François Truffaut');
    expect(result.anio).toBe(1983);
    expect(result.editorial).toBe('Alianza');
    expect(result.lengua).toBe('es');
    expect(result.paisEdicion).toBe('España');
    expect(result.caratula).toBe('https://example.com/c.jpg');
  });

  it('falls back to Open Library when Google has no match', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'ISBN:9780306406157': {
            title: 'Example',
            authors: [{ name: 'Author' }],
            publishers: [{ name: 'Pub' }],
            publish_date: '2000',
            cover: { large: 'https://covers.example/L.jpg' },
          },
        }),
      } as Response);

    const result = await service.lookup('9780306406157');

    expect(result.found).toBe(true);
    expect(result.source).toBe('openlibrary');
    expect(result.titulo).toBe('Example');
    expect(result.autores).toBe('Author');
    expect(result.editorial).toBe('Pub');
  });

  it('uses third cover source when Google and Open Library miss cover', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              volumeInfo: {
                title: 'No Cover Book',
                authors: ['A'],
                publishedDate: '2001',
              },
            },
          ],
        }),
      } as Response)
      // openLibraryCover HEAD
      .mockResolvedValueOnce({ ok: false } as Response)
      // bookcover API
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'https://cover.example/third.jpg' }),
      } as Response);

    const result = await service.lookup('9780306406157');

    expect(result.found).toBe(true);
    expect(result.titulo).toBe('No Cover Book');
    expect(result.caratula).toBe('https://cover.example/third.jpg');
  });

  it('returns not found for short ISBN', async () => {
    const result = await service.lookup('123');
    expect(result.found).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
