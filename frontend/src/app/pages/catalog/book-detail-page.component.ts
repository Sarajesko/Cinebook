import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BooksApiService } from '../../core/books/books-api.service';
import {
  Book,
  conditionLabel,
  estadoLabel,
  priceLabel,
  starsLabel,
} from '../../core/books/book.model';
import { LangFlagComponent } from '../../shared/lang-flag.component';

@Component({
  selector: 'app-book-detail-page',
  imports: [RouterLink, LangFlagComponent],
  templateUrl: './book-detail-page.component.html',
  styleUrl: './book-detail-page.component.scss',
})
export class BookDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly booksApi = inject(BooksApiService);

  readonly book = signal<Book | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly conditionLabel = conditionLabel;
  readonly estadoLabel = estadoLabel;
  readonly starsLabel = starsLabel;
  readonly priceLabel = priceLabel;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Libro no encontrado');
      this.loading.set(false);
      return;
    }
    this.booksApi.get(id).subscribe({
      next: (book) => {
        this.book.set(book);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la ficha');
        this.loading.set(false);
      },
    });
  }

  remove(): void {
    const current = this.book();
    if (!current) return;
    if (!confirm(`¿Eliminar «${current.titulo}» del catálogo?`)) return;
    this.booksApi.delete(current.id).subscribe({
      next: () => void this.router.navigateByUrl('/catalogo'),
      error: () => this.error.set('No se pudo eliminar'),
    });
  }
}
