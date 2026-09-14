import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {
  async generateDataUrl(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 240,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('Error generating QR code', err);
      // Fallback data URI with encoded text
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%230f172a">QR: ' + encodeURIComponent(text.substring(0, 20)) + '</text></svg>';
    }
  }
}
