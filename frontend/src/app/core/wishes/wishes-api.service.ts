import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book } from '../books/book.model';
import { BookWritePayload } from '../books/books-api.service';
import { Wish, WishWritePayload } from './wish.model';

export type ToCollectionResult = {
  book: Book;
  closedWishId: string;
  message: string;
};

@Injectable({ providedIn: 'root' })
export class WishesApiService {
  private readonly api = `${environment.apiUrl}/wishes`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Wish[]> {
    return this.http.get<Wish[]>(this.api);
  }

  get(id: string): Observable<Wish> {
    return this.http.get<Wish>(`${this.api}/${id}`);
  }

  create(payload: WishWritePayload): Observable<Wish> {
    return this.http.post<Wish>(this.api, payload);
  }

  update(id: string, payload: Partial<WishWritePayload>): Observable<Wish> {
    return this.http.patch<Wish>(`${this.api}/${id}`, payload);
  }

  delete(id: string): Observable<{ deleted: boolean; id: string }> {
    return this.http.delete<{ deleted: boolean; id: string }>(`${this.api}/${id}`);
  }

  toCollection(id: string, payload: BookWritePayload): Observable<ToCollectionResult> {
    return this.http.post<ToCollectionResult>(`${this.api}/${id}/to-collection`, payload);
  }
}
