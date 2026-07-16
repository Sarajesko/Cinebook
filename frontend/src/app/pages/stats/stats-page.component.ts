import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatsApiService } from '../../core/stats/stats-api.service';
import {
  StatsViewModel,
  mapStatsToView,
} from '../../core/stats/stats-view.mapper';

@Component({
  selector: 'app-stats-page',
  imports: [RouterLink],
  templateUrl: './stats-page.component.html',
  styleUrl: './stats-page.component.scss',
})
export class StatsPageComponent implements OnInit {
  private readonly statsApi = inject(StatsApiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly view = signal<StatsViewModel | null>(null);

  ngOnInit(): void {
    this.statsApi.overview().subscribe({
      next: (data) => {
        this.view.set(mapStatsToView(data));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las estadísticas');
        this.loading.set(false);
      },
    });
  }
}
