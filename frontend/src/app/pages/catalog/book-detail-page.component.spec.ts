import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BooksApiService } from '../../core/books/books-api.service';
import { Book } from '../../core/books/book.model';
import { BookDetailPageComponent } from './book-detail-page.component';

const sample: Book = {
  id: 'b1',
  titulo: 'Hitchcock',
  autores: 'Truffaut',
  anio: 1983,
  editorial: 'Alianza',
  lengua: 'es',
  bandera: 'ES',
  paisEdicion: 'España',
  isbn: '9781234567890',
  estado: 'leyendo',
  fechaCompra: '2026-01-01',
  haceCuanto: 'hace 5 meses',
  condicion: 'segunda_mano',
  precio: 12.5,
  moneda: 'EUR',
  puntuacion: 8,
  caratula: null,
  notas: 'Notas de prueba',
  dondeComprado: null,
  directores: ['Alfred Hitchcock'],
  directoresFotografia: [],
  guionistas: [],
  actores: [],
  productores: [],
  bandaSonora: [],
};

describe('BookDetailPageComponent', () => {
  let fixture: ComponentFixture<BookDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDetailPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'b1' } } },
        },
        {
          provide: BooksApiService,
          useValue: {
            get: () => of(sample),
            delete: () => of({ deleted: true, id: 'b1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetailPageComponent);
    fixture.detectChanges();
  });

  it('renders detail ficha', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hitchcock');
    expect(el.textContent).toContain('Leyendo');
    expect(el.textContent).toContain('Segunda mano');
    expect(el.textContent).toContain('hace 5 meses');
    expect(el.textContent).toContain('Alfred Hitchcock');
    expect(el.textContent).toContain('ES');
    expect(el.querySelector('app-lang-flag')).toBeTruthy();
  });
});
