import { Injectable } from '@angular/core';
import {
  BarcodeFormat,
  DecodeHintType,
  Result,
} from '@zxing/library';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { parseIsbnFromBarcode } from './isbn';

export type IsbnScanResult = {
  raw: string;
  isbn: string;
};

@Injectable({ providedIn: 'root' })
export class IsbnScannerService {
  private controls: IScannerControls | null = null;

  /**
   * Opens the device camera on `video` and resolves barcodes until a
   * plausible ISBN is found. Camera access is mocked in unit tests.
   */
  async start(
    video: HTMLVideoElement,
    onResult: (result: IsbnScanResult) => void,
    onError?: (message: string) => void,
  ): Promise<void> {
    await this.stop();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      onError?.('Este dispositivo no permite usar la cámara. Escribe el ISBN a mano.');
      return;
    }

    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.UPC_A,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints);
    let settled = false;

    try {
      this.controls = await reader.decodeFromVideoDevice(
        undefined,
        video,
        (result: Result | undefined, _err, controls) => {
          if (!result || settled) return;
          const raw = result.getText();
          const isbn = parseIsbnFromBarcode(raw);
          if (!isbn) return;
          settled = true;
          onResult({ raw, isbn });
          controls.stop();
          this.controls = null;
        },
      );
    } catch {
      onError?.(
        'No se pudo abrir la cámara. Comprueba el permiso o escribe el ISBN a mano.',
      );
    }
  }

  async stop(): Promise<void> {
    this.controls?.stop();
    this.controls = null;
  }
}
