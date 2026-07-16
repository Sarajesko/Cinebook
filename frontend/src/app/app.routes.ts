import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { BookDetailPageComponent } from './pages/catalog/book-detail-page.component';
import { BookFormStubComponent } from './pages/catalog/book-form-stub.component';
import { CatalogPageComponent } from './pages/catalog/catalog-page.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { StatsPageComponent } from './pages/stats/stats-page.component';
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
    component: BookFormStubComponent,
    canActivate: [authGuard],
  },
  {
    path: 'catalogo/:id/editar',
    component: BookFormStubComponent,
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
    path: 'estadisticas',
    component: StatsPageComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'catalogo' },
];
