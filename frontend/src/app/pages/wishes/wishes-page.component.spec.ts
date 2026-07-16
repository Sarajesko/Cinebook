import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WishesApiService } from '../../core/wishes/wishes-api.service';
import { Wish } from '../../core/wishes/wish.model';
import { WishesPageComponent } from './wishes-page.component';

const sample: Wish = {
  id: 'w1',
  titulo: 'El cine según Hitchcock',
  autores: 'Truffaut',
  isbn: '9780306406157',
  lengua: 'es',
  paisEdicion: 'España',
  notas: 'Feria',
  prioridad: 'alta',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('WishesPageComponent', () => {
  let fixture: ComponentFixture<WishesPageComponent>;
  let api: jasmine.SpyObj<WishesApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('WishesApiService', ['list', 'delete']);
    api.list.and.returnValue(of([sample]));

    await TestBed.configureTestingModule({
      imports: [WishesPageComponent],
      providers: [
        provideRouter([]),
        { provide: WishesApiService, useValue: api },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishesPageComponent);
  });

  it('renders wishlist items with Ya lo tengo action', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('El cine según Hitchcock');
    expect(el.textContent).toContain('Ya lo tengo');
    expect(el.textContent).toContain('Lo que buscas');
  });

  it('shows empty state', () => {
    api.list.and.returnValue(of([]));
    fixture = TestBed.createComponent(WishesPageComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'La lista de deseos está en blanco',
    );
  });

  it('shows error on failure', () => {
    api.list.and.returnValue(throwError(() => new Error('fail')));
    fixture = TestBed.createComponent(WishesPageComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No se pudo cargar la lista de deseados',
    );
  });
});
