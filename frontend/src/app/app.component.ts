import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly brand = 'Cinebook';
  readonly tagline = 'Cinema Library';
  readonly year = new Date().getFullYear();
  readonly auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
