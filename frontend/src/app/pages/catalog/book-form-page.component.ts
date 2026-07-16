import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BooksApiService,
  BookWritePayload,
  DuplicateCheckResult,
} from '../../core/books/books-api.service';
import { IsbnScannerService } from '../../core/books/isbn-scanner.service';
import { normalizeIsbn, parseIsbnFromBarcode } from '../../core/books/isbn';
import { WishesApiService } from '../../core/wishes/wishes-api.service';

function splitNames(value: string | null | undefined): string[] | undefined {
  if (!value?.trim()) return undefined;
  return value
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
}

function joinNames(names: string[] | undefined | null): string {
  return names?.length ? names.join(', ') : '';
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-book-form-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './book-form-page.component.html',
  styleUrl: './book-form-page.component.scss',
})
export class BookFormPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly booksApi = inject(BooksApiService);
  private readonly wishesApi = inject(WishesApiService);
  private readonly isbnScanner = inject(IsbnScannerService);

  @ViewChild('scanVideo') scanVideo?: ElementRef<HTMLVideoElement>;

  readonly isEdit = signal(false);
  readonly bookId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly duplicate = signal<DuplicateCheckResult | null>(null);
  readonly pendingWishId = signal<string | null>(null);
  readonly savedBookId = signal<string | null>(null);
  readonly wishClosedMessage = signal<string | null>(null);
  readonly scanning = signal(false);
  readonly scanHint = signal<string | null>(null);
  readonly wishHint = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(1)]],
    autores: ['', [Validators.required, Validators.minLength(1)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1000), Validators.max(2100)]],
    editorial: ['', [Validators.required]],
    lengua: ['es' as 'es' | 'en' | 'fr' | 'pt', [Validators.required]],
    paisEdicion: ['', [Validators.required]],
    isbn: ['', [Validators.required, Validators.minLength(10)]],
    estado: ['por_leer', [Validators.required]],
    fechaCompra: [todayIsoDate(), [Validators.required]],
    condicion: ['nuevo' as 'nuevo' | 'segunda_mano', [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0)]],
    moneda: ['EUR', [Validators.required]],
    puntuacion: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    caratula: [''],
    notas: [''],
    dondeComprado: [''],
    directores: [''],
    guionistas: [''],
    actores: [''],
    productores: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const path = this.route.snapshot.routeConfig?.path ?? '';
    if (path.includes('editar') && id) {
      this.isEdit.set(true);
      this.bookId.set(id);
      this.loading.set(true);
      this.booksApi.get(id).subscribe({
        next: (book) => {
          this.form.patchValue({
            titulo: book.titulo,
            autores: book.autores,
            anio: book.anio,
            editorial: book.editorial,
            lengua: book.lengua,
            paisEdicion: book.paisEdicion,
            isbn: book.isbn,
            estado: book.estado,
            fechaCompra: book.fechaCompra.slice(0, 10),
            condicion: book.condicion,
            precio: book.precio,
            moneda: book.moneda || 'EUR',
            puntuacion: book.puntuacion,
            caratula: book.caratula ?? '',
            notas: book.notas ?? '',
            dondeComprado: book.dondeComprado ?? '',
            directores: joinNames(book.directores),
            guionistas: joinNames(book.guionistas),
            actores: joinNames(book.actores),
            productores: joinNames(book.productores),
          });
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el libro');
          this.loading.set(false);
        },
      });
    }
  }

  ngOnDestroy(): void {
    void this.isbnScanner.stop();
  }

  openScanner(): void {
    this.error.set(null);
    this.scanHint.set('Apunta al código de barras del ISBN…');
    this.scanning.set(true);
    setTimeout(() => void this.beginCamera(), 0);
  }

  async closeScanner(): Promise<void> {
    await this.isbnScanner.stop();
    this.scanning.set(false);
    this.scanHint.set(null);
  }

  /** Apply a scanned/typed ISBN and run anti-duplicado immediately. */
  applyIsbn(raw: string, fromScan = false): void {
    const isbn = parseIsbnFromBarcode(raw) ?? normalizeIsbn(raw);
    if (!isbn || isbn.length < 10) {
      if (fromScan) {
        this.scanHint.set('Código leído, pero no parece un ISBN. Prueba de nuevo o escribe a mano.');
      }
      return;
    }

    this.form.patchValue({ isbn });
    this.form.controls.isbn.markAsDirty();
    this.duplicate.set(null);
    this.wishHint.set(null);

    if (fromScan) {
      void this.closeScanner();
      this.scanHint.set(`ISBN leído: ${isbn}`);
    }

    this.runDuplicateCheck(isbn);
  }

  onIsbnBlur(): void {
    const raw = this.form.controls.isbn.value;
    if (!raw?.trim()) return;
    const normalized = normalizeIsbn(raw);
    if (normalized !== raw) {
      this.form.patchValue({ isbn: normalized });
    }
  }

  submit(force = false): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisa los campos obligatorios');
      return;
    }

    const payload = this.toPayload();
    this.saving.set(true);
    this.error.set(null);
    this.duplicate.set(null);

    if (!force) {
      this.booksApi
        .checkDuplicate({
          isbn: payload.isbn,
          titulo: payload.titulo,
          autores: payload.autores,
          editorial: payload.editorial,
          excludeBookId: this.bookId() ?? undefined,
        })
        .subscribe({
          next: (result) => {
            if (result.duplicate) {
              this.duplicate.set(result);
              this.saving.set(false);
              return;
            }
            this.persist(payload, result.wishMatch?.id ?? null);
          },
          error: () => {
            this.saving.set(false);
            this.error.set('No se pudo comprobar duplicados');
          },
        });
      return;
    }

    this.persist(payload, this.duplicate()?.wishMatch?.id ?? null);
  }

  confirmDespiteDuplicate(): void {
    this.submit(true);
  }

  closeWish(): void {
    const id = this.pendingWishId();
    if (!id) return;
    this.wishesApi.delete(id).subscribe({
      next: () => {
        this.pendingWishId.set(null);
        this.wishClosedMessage.set('Deseado cerrado en la wishlist.');
        this.goToSavedBook();
      },
      error: () => this.error.set('No se pudo cerrar el deseado'),
    });
  }

  dismissWishOffer(): void {
    this.pendingWishId.set(null);
    this.goToSavedBook();
  }

  private async beginCamera(): Promise<void> {
    const video = this.scanVideo?.nativeElement;
    if (!video || !this.scanning()) return;

    await this.isbnScanner.start(
      video,
      (result) => this.applyIsbn(result.isbn, true),
      (message) => {
        this.scanHint.set(message);
        this.scanning.set(false);
      },
    );
  }

  private runDuplicateCheck(isbn: string): void {
    const v = this.form.getRawValue();
    this.booksApi
      .checkDuplicate({
        isbn,
        titulo: v.titulo.trim() || undefined,
        autores: v.autores.trim() || undefined,
        editorial: v.editorial.trim() || undefined,
        excludeBookId: this.bookId() ?? undefined,
      })
      .subscribe({
        next: (result) => {
          if (result.duplicate) {
            this.duplicate.set(result);
          }
          if (result.wishMatch) {
            this.wishHint.set(
              `Coincide con un deseado: «${result.wishMatch.titulo}». Al guardar podrás cerrarlo.`,
            );
          }
        },
        error: () => {
          /* soft check; ignore network blips while typing */
        },
      });
  }

  private goToSavedBook(): void {
    const id = this.savedBookId();
    if (id) {
      void this.router.navigate(['/catalogo', id]);
    } else {
      void this.router.navigateByUrl('/catalogo');
    }
  }

  private persist(payload: BookWritePayload, wishId: string | null): void {
    const id = this.bookId();
    const req =
      this.isEdit() && id
        ? this.booksApi.update(id, payload)
        : this.booksApi.create(payload);

    req.subscribe({
      next: (book) => {
        this.saving.set(false);
        this.savedBookId.set(book.id);
        const matchId =
          (book as { wishMatch?: { id: string } | null }).wishMatch?.id ??
          wishId;
        if (matchId && !this.isEdit()) {
          this.pendingWishId.set(matchId);
          return;
        }
        void this.router.navigate(['/catalogo', book.id]);
      },
      error: (err: { status?: number; error?: { message?: string } }) => {
        this.saving.set(false);
        if (err.status === 409) {
          this.error.set('Ya tienes un libro con ese ISBN');
        } else {
          this.error.set(err.error?.message ?? 'No se pudo guardar');
        }
      },
    });
  }

  private toPayload(): BookWritePayload {
    const v = this.form.getRawValue();
    const caratula = v.caratula.trim();
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
      ...(caratula ? { caratula } : {}),
      notas: v.notas.trim() || undefined,
      dondeComprado: v.dondeComprado.trim() || undefined,
      directores: splitNames(v.directores),
      guionistas: splitNames(v.guionistas),
      actores: splitNames(v.actores),
      productores: splitNames(v.productores),
    };
  }

  /** Exposed for unit tests */
  buildPayloadForTest(): BookWritePayload {
    return this.toPayload();
  }

  get formInvalid(): boolean {
    return this.form.invalid;
  }
}
