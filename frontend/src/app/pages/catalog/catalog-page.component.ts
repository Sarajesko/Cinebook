import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { BooksApiService } from '../../core/books/books-api.service';
import {
  Book,
  conditionLabel,
  flagEmoji,
  starsLabel,
} from '../../core/books/book.model';
import {
  CatalogFilters,
  EMPTY_FILTERS,
  applyCatalogFilters,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
} from '../../core/books/catalog-filters';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit, OnDestroy {
  private readonly booksApi = inject(BooksApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private syncingFromUrl = false;

  readonly allBooks = signal<Book[]>([]);
  readonly filters = signal<CatalogFilters>({ ...EMPTY_FILTERS });
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filtersOpen = signal(false);

  readonly filteredBooks = computed(() =>
    applyCatalogFilters(this.allBooks(), this.filters()),
  );

  readonly active = computed(() => hasActiveFilters(this.filters()));

  readonly flagEmoji = flagEmoji;
  readonly conditionLabel = conditionLabel;
  readonly starsLabel = starsLabel;

  readonly form = this.fb.nonNullable.group({
    q: [''],
    lengua: ['' as CatalogFilters['lengua']],
    pais: [''],
    estado: [''],
    condicion: ['' as CatalogFilters['condicion']],
    puntuacion: ['' as string],
    anio: ['' as string],
    autor: [''],
    editorial: [''],
    director: [''],
    guionista: [''],
    actor: [''],
    productor: [''],
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((map) => {
      const params: Record<string, string> = {};
      map.keys.forEach((key) => {
        const v = map.get(key);
        if (v != null) params[key] = v;
      });
      const next = filtersFromParams(params);
      this.syncingFromUrl = true;
      this.filters.set(next);
      this.patchForm(next);
      if (this.active()) this.filtersOpen.set(true);
      this.syncingFromUrl = false;
    });

    this.form.valueChanges
      .pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.syncingFromUrl) return;
        this.applyFormToUrl();
      });

    this.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.booksApi.list().subscribe({
      next: (list) => {
        this.allBooks.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo');
        this.loading.set(false);
      },
    });
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  clearFilters(): void {
    this.form.reset({ ...EMPTY_FILTERS, puntuacion: '', anio: '' });
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }

  private patchForm(f: CatalogFilters): void {
    this.form.patchValue(
      {
        q: f.q,
        lengua: f.lengua,
        pais: f.pais,
        estado: f.estado,
        condicion: f.condicion,
        puntuacion: f.puntuacion == null ? '' : String(f.puntuacion),
        anio: f.anio == null ? '' : String(f.anio),
        autor: f.autor,
        editorial: f.editorial,
        director: f.director,
        guionista: f.guionista,
        actor: f.actor,
        productor: f.productor,
      },
      { emitEvent: false },
    );
  }

  private applyFormToUrl(): void {
    const v = this.form.getRawValue();
    const next: CatalogFilters = {
      q: v.q,
      lengua: v.lengua,
      pais: v.pais,
      estado: v.estado,
      condicion: v.condicion,
      puntuacion: v.puntuacion === '' ? null : Number(v.puntuacion),
      anio: v.anio === '' ? null : Number(v.anio),
      autor: v.autor,
      editorial: v.editorial,
      director: v.director,
      guionista: v.guionista,
      actor: v.actor,
      productor: v.productor,
    };
    if (next.puntuacion != null && !Number.isFinite(next.puntuacion)) {
      next.puntuacion = null;
    }
    if (next.anio != null && !Number.isFinite(next.anio)) {
      next.anio = null;
    }
    this.filters.set(next);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtersToParams(next),
      replaceUrl: true,
    });
  }
}
