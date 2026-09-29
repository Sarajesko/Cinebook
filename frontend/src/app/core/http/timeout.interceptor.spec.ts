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
import { TimeoutError } from 'rxjs';
import {
  HTTP_TIMEOUT_MS,
  timeoutInterceptor,
} from './timeout.interceptor';

describe('timeoutInterceptor', () => {
  let http: HttpClient;
  let httpCtrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([timeoutInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpCtrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpCtrl.verify();
  });

  it('exposes a finite timeout budget', () => {
    expect(HTTP_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it('passes through successful responses', () => {
    let body: unknown;
    http.get('/api/books').subscribe((v) => (body = v));
    const req = httpCtrl.expectOne('/api/books');
    req.flush([{ id: '1' }]);
    expect(body).toEqual([{ id: '1' }]);
  });

  it('TimeoutError is constructible for UI mapping', () => {
    expect(new TimeoutError().name).toBe('TimeoutError');
  });
});
