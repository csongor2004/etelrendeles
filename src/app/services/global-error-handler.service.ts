import { ErrorHandler, Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor(private zone: NgZone) {}

  handleError(error: any): void {
    // Firebase Auth related errors - ne írd ki őket a konzolra
    if (error && error.code && error.code.startsWith('auth/')) {
      return;
    }
    
    // HTTP hibák elnyomása (opcionális)
    if (error && error.status && error.status >= 400) {
      return;
    }
    
    // Ha szeretnéd teljesen kikapcsolni a konzol hibákat, ezt használd:
     return;
    
    // Vagy ha csak bizonyos hibákat akarsz látni:
    // A default Angular error handler itt meghívható lenne
    // console.error('Kezeletlen hiba:', error);
  }
}