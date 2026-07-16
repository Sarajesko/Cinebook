import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookWritePayload } from '../../core/books/books-api.service';
import { normalizeIsbn } from '../../core/books/isbn';
import { WishesApiService } from '../../core/wishes/wishes-api.service';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-wish-to-collection-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './wish-to-collection-page.component.html',
  styleUrl: './wish-to-collection-page.component.scss',
})
export class WishToCollectionPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly wishesApi = inject(WishesApiService);

  readonly wishId = signal<string | null>(null);
  readonly wishTitle = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required]],
    autores: ['', [Validators.required]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1000), Validators.max(2100)]],
    editorial: ['', [Validators.required]],
    lengua: ['es' as 'es' | 'en' | 'fr' | 'pt', [Validators.required]],
    paisEdicion: ['', [Validators.required]],
    isbn: ['', [Validators.required, Validators.minLength(10)]],
    estado: ['recien_comprado', [Validators.required]],
    fechaCompra: [todayIsoDate(), [Validators.required]],
    condicion: ['nuevo' as 'nuevo' | 'segunda_mano', [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0)]],
    moneda: ['EUR', [Validators.required]],
    puntuacion: [7, [Validators.required, Validators.min(1), Validators.max(10)]],
    notas: [''],
    dondeComprado: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Deseado no encontrado');
      this.loading.set(false);
      return;
    }
    this.wishId.set(id);
    this.wishesApi.get(id).subscribe({
      next: (wish) => {
        this.wishTitle.set(wish.titulo);
        this.form.patchValue({
          titulo: wish.titulo,
          autores: wish.autores ?? '',
          isbn: wish.isbn ?? '',
          lengua: (wish.lengua ?? 'es') as 'es' | 'en' | 'fr' | 'pt',
          paisEdicion: wish.paisEdicion ?? '',
          notas: wish.notas ?? '',
          estado: 'recien_comprado',
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el deseado');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa los campos obligatorios del ejemplar');
      return;
    }
    const id = this.wishId();
    if (!id) return;

    const payload = this.toPayload();
    this.saving.set(true);
    this.error.set(null);

    this.wishesApi.toCollection(id, payload).subscribe({
      next: (result) => {
        this.saving.set(false);
        void this.router.navigate(['/catalogo', result.book.id]);
      },
      error: (err: { status?: number; error?: { message?: string | string[] } }) => {
        this.saving.set(false);
        const msg = err.error?.message;
        this.error.set(
          Array.isArray(msg)
            ? msg.join(', ')
            : (msg ?? (err.status === 409 ? 'Ese ISBN ya está en tu catálogo' : 'No se pudo pasar a colección')),
        );
      },
    });
  }

  /** Exposed for unit tests */
  buildPayloadForTest(): BookWritePayload {
    return this.toPayload();
  }

  private toPayload(): BookWritePayload {
    const v = this.form.getRawValue();
    return {
      titulo: v.titulo.trim(),
      autores: v.autores.trim(),
      anio: Number(v.anio),
      editorial: v.editorial.trim(),
      lengua: v.lengua,
      paisEdicion: v.paisEdicion.trim(),
      isbn: normalizeIsbn(v.isbn),
      estado: v.estado,
      fechaCompra: v.fechaCompra,
      condicion: v.condicion,
      precio: Number(v.precio),
      moneda: v.moneda.trim() || 'EUR',
      puntuacion: Number(v.puntuacion),
      ...(v.notas.trim() ? { notas: v.notas.trim() } : {}),
      ...(v.dondeComprado.trim() ? { dondeComprado: v.dondeComprado.trim() } : {}),
    };
  }
}
