import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { lenguaBandera } from '../../core/books/book.model';
import { WishesApiService } from '../../core/wishes/wishes-api.service';
import {
  Wish,
  sortWishes,
  wishPriorityLabel,
} from '../../core/wishes/wish.model';
import { LangFlagComponent } from '../../shared/lang-flag.component';

@Component({
  selector: 'app-wishes-page',
  imports: [RouterLink, LangFlagComponent],
  templateUrl: './wishes-page.component.html',
  styleUrl: './wishes-page.component.scss',
})
export class WishesPageComponent implements OnInit {
  private readonly wishesApi = inject(WishesApiService);

  readonly wishes = signal<Wish[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);

  readonly wishPriorityLabel = wishPriorityLabel;
  readonly lenguaBandera = lenguaBandera;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.wishesApi.list().subscribe({
      next: (list) => {
        this.wishes.set(sortWishes(list));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de deseados');
        this.loading.set(false);
      },
    });
  }

  remove(wish: Wish): void {
    if (!confirm(`¿Quitar «${wish.titulo}» de deseados?`)) return;
    this.deletingId.set(wish.id);
    this.wishesApi.delete(wish.id).subscribe({
      next: () => {
        this.wishes.update((list) => list.filter((w) => w.id !== wish.id));
        this.deletingId.set(null);
      },
      error: () => {
        this.error.set('No se pudo borrar el deseado');
        this.deletingId.set(null);
      },
    });
  }
}
