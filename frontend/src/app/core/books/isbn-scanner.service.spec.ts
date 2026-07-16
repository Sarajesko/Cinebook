import { TestBed } from '@angular/core/testing';
import { IsbnScannerService } from './isbn-scanner.service';

describe('IsbnScannerService', () => {
  let service: IsbnScannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IsbnScannerService);
  });

  it('reports when camera API is unavailable', async () => {
    const original = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    });

    const onError = jasmine.createSpy('onError');
    const video = document.createElement('video');
    await service.start(video, () => undefined, onError);

    expect(onError).toHaveBeenCalled();
    expect(String(onError.calls.mostRecent().args[0])).toContain('cámara');

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: original,
    });
  });

  it('stop is safe when nothing is running', async () => {
    await expectAsync(service.stop()).toBeResolved();
  });
});
