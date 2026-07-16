import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book } from './book.model';

export type BookWritePayload = {
  titulo: string;
  autores: string;
  anio: number;
  editorial: string;
  lengua: 'es' | 'en' | 'fr' | 'pt';
  paisEdicion: string;
  isbn: string;
  estado: string;
  fechaCompra: string;
  condicion: 'nuevo' | 'segunda_mano';
  precio: number;
  moneda?: string;
  puntuacion: number;
  caratula?: string;
  notas?: string;
  dondeComprado?: string;
  directores?: string[];
  guionistas?: string[];
  actores?: string[];
  productores?: string[];
};

export type DuplicateCheckResult = {
  duplicate: boolean;
  matchBy: 'isbn' | 'titulo_autor_editorial' | null;
  message: string | null;
  book: Book | null;
  wishMatch: { id: string; titulo: string; isbn?: string | null; matchedBy?: string } | null;
};

@Injectable({ providedIn: 'root' })
export class BooksApiService {
  private readonly api = `${environment.apiUrl}/books`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Book[]> {
    return this.http.get<Book[]>(this.api);
  }

  get(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.api}/${id}`);
  }

  create(payload: BookWritePayload): Observable<Book> {
    return this.http.post<Book>(this.api, payload);
  }

  update(id: string, payload: Partial<BookWritePayload>): Observable<Book> {
    return this.http.patch<Book>(`${this.api}/${id}`, payload);
  }

  delete(id: string): Observable<{ deleted: boolean; id: string }> {
    return this.http.delete<{ deleted: boolean; id: string }>(`${this.api}/${id}`);
  }

  checkDuplicate(body: {
    isbn?: string;
    titulo?: string;
    autores?: string;
    editorial?: string;
    excludeBookId?: string;
  }): Observable<DuplicateCheckResult> {
    return this.http.post<DuplicateCheckResult>(`${this.api}/check-duplicate`, body);
  }
}
