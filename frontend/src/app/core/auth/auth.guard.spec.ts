import { TestBed } from '@angular/core/testing';
import {
  GuardResult,
  MaybeAsync,
  provideRouter,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, from, isObservable, of } from 'rxjs';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

function asObservable(result: MaybeAsync<GuardResult>): Observable<GuardResult> {
  if (isObservable(result)) {
    return result;
  }
  if (result instanceof Promise) {
    return from(result);
  }
  return of(result);
}

describe('authGuard / guestGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', [
      'isLoggedIn',
      'validateSession',
    ]);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    });
    router = TestBed.inject(Router);
    spyOn(router, 'createUrlTree').and.callThrough();
  });

  it('authGuard redirects to login when logged out', () => {
    auth.isLoggedIn.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );
    expect(result).toEqual(jasmine.any(UrlTree));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('authGuard allows when session validates', (done) => {
    auth.isLoggedIn.and.returnValue(true);
    auth.validateSession.and.returnValue(of(true));
    asObservable(
      TestBed.runInInjectionContext(() =>
        authGuard({} as never, {} as never),
      ),
    ).subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('authGuard redirects when session is invalid', (done) => {
    auth.isLoggedIn.and.returnValue(true);
    auth.validateSession.and.returnValue(of(false));
    asObservable(
      TestBed.runInInjectionContext(() =>
        authGuard({} as never, {} as never),
      ),
    ).subscribe((result) => {
      expect(result).toEqual(jasmine.any(UrlTree));
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('guestGuard allows when logged out', () => {
    auth.isLoggedIn.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as never, {} as never),
    );
    expect(result).toBeTrue();
  });

  it('guestGuard redirects to catalogo when session ok', (done) => {
    auth.isLoggedIn.and.returnValue(true);
    auth.validateSession.and.returnValue(of(true));
    asObservable(
      TestBed.runInInjectionContext(() =>
        guestGuard({} as never, {} as never),
      ),
    ).subscribe((result) => {
      expect(result).toEqual(jasmine.any(UrlTree));
      expect(router.createUrlTree).toHaveBeenCalledWith(['/catalogo']);
      done();
    });
  });
});
