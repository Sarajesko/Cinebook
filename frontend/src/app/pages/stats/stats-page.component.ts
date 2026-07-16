import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Book } from '../../core/books/book.model';
import { BooksApiService } from '../../core/books/books-api.service';
import { StatsApiService } from '../../core/stats/stats-api.service';
import {
  StatsPeriodGrain,
  StatsViewModel,
  mapStatsToView,
} from '../../core/stats/stats-view.mapper';
import { LangFlagComponent } from '../../shared/lang-flag.component';

@Component({
  selector: 'app-stats-page',
  imports: [RouterLink, LangFlagComponent, FormsModule],
  templateUrl: './stats-page.component.html',
  styleUrl: './stats-page.component.scss',
})
export class StatsPageComponent implements OnInit {
  private readonly statsApi = inject(StatsApiService);
  private readonly booksApi = inject(BooksApiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly view = signal<StatsViewModel | null>(null);
  readonly books = signal<Book[]>([]);
  readonly periodGrain = signal<StatsPeriodGrain>('meses');
  readonly searchQuery = signal('');

  readonly periodRows = computed(() => {
    const v = this.view();
    if (!v) return [];
    return v.timeline[this.periodGrain()];
  });

  readonly periodHint = computed(() => {
    switch (this.periodGrain()) {
      case 'semanas':
        return 'Por semana ISO (fecha de compra)';
      case 'anios':
        return 'Por año (fecha de compra)';
      default:
        return 'Por mes (fecha de compra)';
    }
  });

  readonly q = computed(() => this.searchQuery().trim().toLowerCase());

  readonly matchedBooks = computed(() => {
    const needle = this.q();
    if (!needle) return [];
    return this.books().filter((book) => bookMatches(book, needle)).slice(0, 12);
  });

  readonly filteredEditorials = computed(() => {
    const v = this.view();
    if (!v) return [];
    const needle = this.q();
    if (!needle) return v.byEditorial;
    return v.byEditorial.filter((row) => row.label.toLowerCase().includes(needle));
  });

  readonly filteredFiguras = computed(() => {
    const v = this.view();
    if (!v) return [];
    const needle = this.q();
    if (!needle) return v.figurasTop;
    return v.figurasTop.filter(
      (f) =>
        f.nombre.toLowerCase().includes(needle) ||
        f.roleLabel.toLowerCase().includes(needle),
    );
  });

  ngOnInit(): void {
    this.statsApi.overview().subscribe({
      next: (data) => {
        this.view.set(mapStatsToView(data));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las estadísticas');
        this.loading.set(false);
      },
    });
    this.booksApi.list().subscribe({
      next: (list) => this.books.set(list),
      error: () => {
        /* stats still usable without book hits */
      },
    });
  }

  setGrain(grain: StatsPeriodGrain): void {
    this.periodGrain.set(grain);
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }
}

function bookMatches(book: Book, needle: string): boolean {
  const haystack = [
    book.titulo,
    book.autores,
    book.editorial,
    book.paisEdicion ?? '',
    book.isbn,
    ...(book.directores ?? []),
    ...(book.directoresFotografia ?? []),
    ...(book.guionistas ?? []),
    ...(book.actores ?? []),
    ...(book.productores ?? []),
    ...(book.bandaSonora ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}
