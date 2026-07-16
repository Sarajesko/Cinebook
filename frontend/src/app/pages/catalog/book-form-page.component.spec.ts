import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BooksApiService } from '../../core/books/books-api.service';
import { IsbnScannerService } from '../../core/books/isbn-scanner.service';
import { WishesApiService } from '../../core/wishes/wishes-api.service';
import { BookFormPageComponent } from './book-form-page.component';

describe('BookFormPageComponent', () => {
  let fixture: ComponentFixture<BookFormPageComponent>;
  let component: BookFormPageComponent;
  let booksApi: {
    get: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
    checkDuplicate: jasmine.Spy;
    lookupIsbn: jasmine.Spy;
  };

  beforeEach(async () => {
    booksApi = {
      get: jasmine.createSpy('get').and.returnValue(of({})),
      create: jasmine.createSpy('create').and.returnValue(of({ id: 'b1' })),
      update: jasmine.createSpy('update').and.returnValue(of({ id: 'b1' })),
      checkDuplicate: jasmine.createSpy('checkDuplicate').and.returnValue(
        of({
          duplicate: false,
          matchBy: null,
          message: null,
          book: null,
          wishMatch: null,
        }),
      ),
      lookupIsbn: jasmine.createSpy('lookupIsbn').and.returnValue(
        of({ found: false, source: null, isbn: '9780306406157' }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [BookFormPageComponent],
      providers: [
        provideRouter([]),
        { provide: BooksApiService, useValue: booksApi },
        {
          provide: WishesApiService,
          useValue: { delete: () => of({ deleted: true, id: 'w1' }) },
        },
        {
          provide: IsbnScannerService,
          useValue: {
            start: jasmine.createSpy('start').and.resolveTo(undefined),
            stop: jasmine.createSpy('stop').and.resolveTo(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marks form invalid when required fields empty', () => {
    component.form.patchValue({
      titulo: '',
      autores: '',
      editorial: '',
      isbn: '',
    });
    expect(component.formInvalid).toBeTrue();
  });

  it('builds payload when form is valid', () => {
    component.form.patchValue({
      titulo: 'Hitchcock',
      autores: 'Truffaut',
      anio: 1983,
      editorial: 'Alianza',
      lengua: 'es',
      paisEdicion: 'España',
      isbn: '9788420674237',
      estado: 'por_leer',
      fechaCompra: '2026-07-01',
      condicion: 'nuevo',
      precio: 18.5,
      moneda: 'EUR',
      puntuacion: 8,
      caratula: 'https://example.com/c.jpg',
      directores: 'Alfred Hitchcock,  ',
    });
    expect(component.formInvalid).toBeFalse();
    const payload = component.buildPayloadForTest();
    expect(payload.titulo).toBe('Hitchcock');
    expect(payload.directores).toEqual(['Alfred Hitchcock']);
    expect(payload.caratula).toBe('https://example.com/c.jpg');
    expect(payload.puntuacion).toBe(8);
  });

  it('allows saving without precio, moneda or puntuacion', () => {
    component.form.patchValue({
      titulo: 'Hitchcock',
      autores: 'Truffaut',
      anio: 1983,
      editorial: 'Alianza',
      lengua: 'es',
      paisEdicion: 'España',
      isbn: '9788420674237',
      estado: 'por_leer',
      fechaCompra: '2026-07-01',
      condicion: 'nuevo',
      precio: null,
      moneda: '',
      puntuacion: null,
    });
    expect(component.formInvalid).toBeFalse();
    const payload = component.buildPayloadForTest();
    expect(payload.precio).toBeNull();
    expect(payload.moneda).toBeNull();
    expect(payload.puntuacion).toBeNull();
  });

  it('renders create title and scan button', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Añadir libro');
    expect(el.textContent).toContain('Escanear ISBN');
    expect(el.textContent).toContain('Autocompletar ficha');
  });

  it('applies scanned ISBN and runs duplicate check plus lookup', () => {
    component.applyIsbn('978-0-306-40615-7', true);
    expect(component.form.controls.isbn.value).toBe('9780306406157');
    expect(booksApi.checkDuplicate).toHaveBeenCalledWith(
      jasmine.objectContaining({ isbn: '9780306406157' }),
    );
    expect(booksApi.lookupIsbn).toHaveBeenCalledWith('9780306406157');
  });
});
