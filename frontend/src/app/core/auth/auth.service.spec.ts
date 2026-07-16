import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('isLoggedIn is false without token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('login stores token and user', () => {
    service.login('cinefilo', 'secreto1').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      user: { id: 'u1', handle: 'cinefilo' },
      accessToken: 'tok-123',
    });

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.token).toBe('tok-123');
    expect(service.user()?.handle).toBe('cinefilo');
  });

  it('register stores session', () => {
    service.register('nuevo', 'secreto1').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush({
      user: { id: 'u2', handle: 'nuevo' },
      accessToken: 'tok-456',
    });

    expect(service.token).toBe('tok-456');
  });

  it('logout clears session', () => {
    localStorage.setItem('cinebook_token', 'x');
    localStorage.setItem('cinebook_user', JSON.stringify({ id: 'u1', handle: 'a' }));
    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.user()).toBeNull();
  });
});
