import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BooksApiService } from '../../core/books/books-api.service';
import { Book } from '../../core/books/book.model';
import { CatalogPageComponent } from './catalog-page.component';

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
  estado: 'por_leer',
  fechaCompra: '2026-01-01',
  haceCuanto: 'hace 5 meses',
  condicion: 'nuevo',
  precio: 20,
  moneda: 'EUR',
  puntuacion: 9,
  caratula: null,
  notas: null,
  dondeComprado: null,
  directores: ['Alfred Hitchcock'],
  directoresFotografia: [],
  guionistas: [],
  actores: [],
  productores: [],
  bandaSonora: [],
};

describe('CatalogPageComponent', () => {
  let fixture: ComponentFixture<CatalogPageComponent>;
  let api: jasmine.SpyObj<BooksApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('BooksApiService', ['list']);
    api.list.and.returnValue(of([sample]));

    await TestBed.configureTestingModule({
      imports: [CatalogPageComponent],
      providers: [
        provideRouter([]),
        { provide: BooksApiService, useValue: api },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPageComponent);
  });

  it('renders books from API', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hitchcock');
    expect(el.textContent).toContain('Hitchcock');
    expect(el.querySelector('app-lang-flag')).toBeTruthy();
    expect(el.textContent).toContain('Nuevo');
  });

  it('shows empty state', () => {
    api.list.and.returnValue(of([]));
    fixture = TestBed.createComponent(CatalogPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('La sala de lectura está vacía');
  });

  it('shows error on failure', () => {
    api.list.and.returnValue(throwError(() => new Error('fail')));
    fixture = TestBed.createComponent(CatalogPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No se pudo cargar el catálogo');
  });
});
