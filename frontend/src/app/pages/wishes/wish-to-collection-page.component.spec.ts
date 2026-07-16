import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { WishesApiService } from '../../core/wishes/wishes-api.service';
import { WishToCollectionPageComponent } from './wish-to-collection-page.component';

describe('WishToCollectionPageComponent', () => {
  let fixture: ComponentFixture<WishToCollectionPageComponent>;
  let component: WishToCollectionPageComponent;
  let api: jasmine.SpyObj<WishesApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('WishesApiService', ['get', 'toCollection']);
    api.get.and.returnValue(
      of({
        id: 'w1',
        titulo: 'Hitchcock',
        autores: 'Truffaut',
        isbn: '9780306406157',
        lengua: 'es',
        paisEdicion: 'España',
        notas: null,
        prioridad: 'media',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    );
    api.toCollection.and.returnValue(
      of({
        book: { id: 'b1' } as never,
        closedWishId: 'w1',
        message: 'ok',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [WishToCollectionPageComponent],
      providers: [
        provideRouter([]),
        { provide: WishesApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'w1' }),
              routeConfig: { path: 'deseados/:id/conseguir' },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishToCollectionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('prefills from wish and builds collection payload', () => {
    expect(component.form.controls.titulo.value).toBe('Hitchcock');
    expect(component.form.controls.isbn.value).toBe('9780306406157');
    expect(component.form.controls.estado.value).toBe('recien_comprado');

    component.form.patchValue({
      editorial: 'Alianza',
      anio: 1983,
      precio: 15,
      puntuacion: 8,
    });
    const payload = component.buildPayloadForTest();
    expect(payload.titulo).toBe('Hitchcock');
    expect(payload.estado).toBe('recien_comprado');
    expect(payload.isbn).toBe('9780306406157');
  });

  it('calls toCollection on submit', () => {
    component.form.patchValue({
      editorial: 'Alianza',
      anio: 1983,
      precio: 15,
      puntuacion: 8,
      paisEdicion: 'España',
      autores: 'Truffaut',
      isbn: '9780306406157',
    });
    component.submit();
    expect(api.toCollection).toHaveBeenCalledWith(
      'w1',
      jasmine.objectContaining({
        titulo: 'Hitchcock',
        estado: 'recien_comprado',
      }),
    );
  });

  it('renders Ya lo tengo title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ya lo tengo');
    expect(el.textContent).toContain('Pasar a colección');
  });
});
