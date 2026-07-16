import { Component } from '@angular/core';

@Component({
  selector: 'app-wishes-page',
  template: `
    <section class="placeholder">
      <h1>Deseados</h1>
      <p>Lista de deseos — UI en un apartado posterior.</p>
    </section>
  `,
  styles: `
    .placeholder {
      padding: 1rem 0 3rem;
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
    }
    p {
      margin: 0;
      opacity: 0.75;
      font-style: italic;
    }
  `,
})
export class WishesPageComponent {}
