import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Placeholder hasta el apartado 10 (formularios). */
@Component({
  selector: 'app-book-form-stub',
  imports: [RouterLink],
  template: `
    <section>
      <p><a routerLink="/catalogo">← Catálogo</a></p>
      <h1>Alta / edición</h1>
      <p class="lead">El formulario completo llega en el siguiente apartado.</p>
    </section>
  `,
  styles: `
    a {
      color: inherit;
      opacity: 0.75;
    }
    h1 {
      margin: 1rem 0 0.35rem;
    }
    .lead {
      margin: 0;
      font-style: italic;
      opacity: 0.75;
    }
  `,
})
export class BookFormStubComponent {}
