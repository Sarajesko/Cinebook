import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WishesApiService } from '../../core/wishes/wishes-api.service';
import { WishWritePayload } from '../../core/wishes/wish.model';
import { normalizeIsbn } from '../../core/books/isbn';

@Component({
  selector: 'app-wish-form-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './wish-form-page.component.html',
  styleUrl: './wish-form-page.component.scss',
})
export class WishFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly wishesApi = inject(WishesApiService);

  readonly isEdit = signal(false);
  readonly wishId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(1)]],
    autores: [''],
    isbn: [''],
    lengua: ['' as '' | 'es' | 'en' | 'fr' | 'pt'],
    paisEdicion: [''],
    notas: [''],
    prioridad: ['media' as 'alta' | 'media' | 'baja'],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const path = this.route.snapshot.routeConfig?.path ?? '';
    if (path.includes('editar') && id) {
      this.isEdit.set(true);
      this.wishId.set(id);
      this.loading.set(true);
      this.wishesApi.get(id).subscribe({
        next: (wish) => {
          this.form.patchValue({
            titulo: wish.titulo,
            autores: wish.autores ?? '',
            isbn: wish.isbn ?? '',
            lengua: (wish.lengua ?? '') as '' | 'es' | 'en' | 'fr' | 'pt',
            paisEdicion: wish.paisEdicion ?? '',
            notas: wish.notas ?? '',
            prioridad: (wish.prioridad as 'alta' | 'media' | 'baja') || 'media',
          });
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el deseado');
          this.loading.set(false);
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('El título es obligatorio');
      return;
    }

    const payload = this.toPayload();
    this.saving.set(true);
    this.error.set(null);

    const id = this.wishId();
    const req =
      this.isEdit() && id
        ? this.wishesApi.update(id, payload)
        : this.wishesApi.create(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigateByUrl('/deseados');
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.error.set(err.error?.message ?? 'No se pudo guardar');
      },
    });
  }

  private toPayload(): WishWritePayload {
    const v = this.form.getRawValue();
    const isbn = v.isbn.trim() ? normalizeIsbn(v.isbn) : undefined;
    return {
      titulo: v.titulo.trim(),
      ...(v.autores.trim() ? { autores: v.autores.trim() } : {}),
      ...(isbn ? { isbn } : {}),
      ...(v.lengua ? { lengua: v.lengua } : {}),
      ...(v.paisEdicion.trim() ? { paisEdicion: v.paisEdicion.trim() } : {}),
      ...(v.notas.trim() ? { notas: v.notas.trim() } : {}),
      prioridad: v.prioridad,
    };
  }

  get formInvalid(): boolean {
    return this.form.invalid;
  }
}
