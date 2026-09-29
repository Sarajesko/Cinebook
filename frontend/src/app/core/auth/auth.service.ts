import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type AuthUser = {
  id: string;
  handle: string;
  createdAt?: string;
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

const TOKEN_KEY = 'cinebook_token';
const USER_KEY = 'cinebook_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  readonly user = signal<AuthUser | null>(this.readUser());
  /** Evita llamar /auth/me en cada navegación tras validar una vez. */
  private sessionOk = false;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  /**
   * Comprueba el JWT contra la API. Solo limpia la sesión si el token es
   * inválido (401). Si el servidor no responde, no borra el login local.
   */
  validateSession(): Observable<boolean> {
    if (!this.token) {
      this.clearSession();
      return of(false);
    }
    if (this.sessionOk && this.user()) {
      return of(true);
    }
    return this.http.get<AuthUser>(`${this.api}/auth/me`).pipe(
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.user.set(user);
        this.sessionOk = true;
      }),
      map(() => true),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.clearSession();
          return of(false);
        }
        // API caída / timeout: mantener sesión; el catálogo puede reintentar.
        return of(true);
      }),
    );
  }

  register(handle: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/register`, { handle, password })
      .pipe(tap((res) => this.persist(res)));
  }

  login(handle: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/login`, { handle, password })
      .pipe(tap((res) => this.persist(res)));
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.sessionOk = false;
  }

  logout(): void {
    this.clearSession();
    void this.router.navigateByUrl('/login');
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
    this.sessionOk = true;
  }

  private readUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
