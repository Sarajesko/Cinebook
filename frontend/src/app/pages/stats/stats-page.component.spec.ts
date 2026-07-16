import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StatsApiService } from '../../core/stats/stats-api.service';
import { StatsOverview } from '../../core/stats/stats.model';
import { StatsPageComponent } from './stats-page.component';

const sample: StatsOverview = {
  totalLibros: 2,
  byLengua: [{ key: 'es', count: 2, bandera: 'ES' }],
  byPais: [{ key: 'España', count: 2 }],
  byDecada: [{ key: '1980s', count: 2 }],
  byEditorial: [{ key: 'Alianza', count: 2 }],
  byEstado: [{ key: 'por_leer', count: 2 }],
  byCondicion: [{ key: 'nuevo', count: 2 }],
  gasto: { total: 40, media: 20, moneda: 'EUR', libros: 2 },
  puntuaciones: {
    media: 8,
    distribution: { '8': 2 },
  },
  crecimiento: [{ periodo: '2026-07', count: 2 }],
  figurasTop: [],
  figurasPorRol: {
    directores: [],
    guionistas: [],
    actores: [],
    productores: [],
  },
  wishlist: { abiertos: 1 },
};

describe('StatsPageComponent', () => {
  let fixture: ComponentFixture<StatsPageComponent>;
  let api: jasmine.SpyObj<StatsApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('StatsApiService', ['overview']);
    api.overview.and.returnValue(of(sample));

    await TestBed.configureTestingModule({
      imports: [StatsPageComponent],
      providers: [
        provideRouter([]),
        { provide: StatsApiService, useValue: api },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsPageComponent);
  });

  it('renders sala en números from API', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('La sala en números');
    expect(el.textContent).toContain('2');
    expect(el.textContent).toContain('🇪🇸');
    expect(el.textContent).toContain('40 EUR');
    expect(el.textContent).toContain('deseado abierto');
  });

  it('shows empty state', () => {
    api.overview.and.returnValue(
      of({
        ...sample,
        totalLibros: 0,
        byLengua: [],
        gasto: { total: 0, media: 0, moneda: 'EUR', libros: 0 },
        puntuaciones: { media: 0, distribution: {} },
        crecimiento: [],
        wishlist: { abiertos: 0 },
      }),
    );
    fixture = TestBed.createComponent(StatsPageComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Aún no hay números que contar',
    );
  });

  it('shows error on failure', () => {
    api.overview.and.returnValue(throwError(() => new Error('fail')));
    fixture = TestBed.createComponent(StatsPageComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No se pudieron cargar las estadísticas',
    );
  });
});
