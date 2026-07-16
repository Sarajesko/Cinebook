import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatsOverview } from './stats.model';

@Injectable({ providedIn: 'root' })
export class StatsApiService {
  private readonly api = `${environment.apiUrl}/stats`;

  constructor(private readonly http: HttpClient) {}

  overview(): Observable<StatsOverview> {
    return this.http.get<StatsOverview>(this.api);
  }
}
