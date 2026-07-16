import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooksApiService } from '../../core/books/books-api.service';
import {
  Book,
  conditionLabel,
  flagEmoji,
  starsLabel,
} from '../../core/books/book.model';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit {
  private readonly booksApi = inject(BooksApiService);

  readonly books = signal<Book[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly flagEmoji = flagEmoji;
  readonly conditionLabel = conditionLabel;
  readonly starsLabel = starsLabel;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.booksApi.list().subscribe({
      next: (list) => {
        this.books.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo');
        this.loading.set(false);
      },
    });
  }
}
