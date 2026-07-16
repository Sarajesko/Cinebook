import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book } from './book.model';

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

  delete(id: string): Observable<{ deleted: boolean; id: string }> {
    return this.http.delete<{ deleted: boolean; id: string }>(`${this.api}/${id}`);
  }
}
