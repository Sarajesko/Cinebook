import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpCtrl: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpCtrl = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpCtrl.verify();
    localStorage.clear();
  });

  it('attaches Authorization when token exists', () => {
    localStorage.setItem('cinebook_token', 'tok-abc');
    http.get('/api/books').subscribe({ error: () => undefined });
    const req = httpCtrl.expectOne('/api/books');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-abc');
    req.flush([]);
  });

  it('clears session on 401 for protected calls', () => {
    localStorage.setItem('cinebook_token', 'stale');
    localStorage.setItem(
      'cinebook_user',
      JSON.stringify({ id: 'u1', handle: 'cinefilo' }),
    );
    auth.user.set({ id: 'u1', handle: 'cinefilo' });

    http.get('/api/books').subscribe({ error: () => undefined });
    const req = httpCtrl.expectOne('/api/books');
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(auth.isLoggedIn()).toBeFalse();
    expect(auth.user()).toBeNull();
  });

  it('does not clear session on 401 from login', () => {
    http.post('/api/auth/login', {}).subscribe({ error: () => undefined });
    const req = httpCtrl.expectOne('/api/auth/login');
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );
    expect(auth.isLoggedIn()).toBeFalse();
  });
});
