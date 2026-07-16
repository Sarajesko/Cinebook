import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { BookDetailPageComponent } from './pages/catalog/book-detail-page.component';
import { BookFormPageComponent } from './pages/catalog/book-form-page.component';
import { CatalogPageComponent } from './pages/catalog/catalog-page.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { StatsPageComponent } from './pages/stats/stats-page.component';
import { WishFormPageComponent } from './pages/wishes/wish-form-page.component';
import { WishToCollectionPageComponent } from './pages/wishes/wish-to-collection-page.component';
import { WishesPageComponent } from './pages/wishes/wishes-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalogo' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'registro',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'catalogo',
    component: CatalogPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'catalogo/nuevo',
    component: BookFormPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'catalogo/:id/editar',
    component: BookFormPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'catalogo/:id',
    component: BookDetailPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'deseados',
    component: WishesPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'deseados/nuevo',
    component: WishFormPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'deseados/:id/editar',
    component: WishFormPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'deseados/:id/conseguir',
    component: WishToCollectionPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'estadisticas',
    component: StatsPageComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'catalogo' },
];
