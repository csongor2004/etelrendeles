import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleOverrideService {
  private originalConsole: any = {};

  constructor() {
    // Mentsd el az eredeti console metódusokat
    this.originalConsole.error = console.error;
    this.originalConsole.warn = console.warn;

    // Firebase kapcsolódási hibák elnyomása
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Szűrés a Firebase hibákra
      if (message.includes('Firebase') && (
          message.includes('auth') || 
          message.includes('authentication') || 
          message.includes('permission')
      )) {
        // Nem jelenítjük meg a Firebase hibákat
        return;
      }
      
      // Minden más hibát megjelenítünk
      this.originalConsole.error(...args);
    };

    // Figyelmeztetések szűrése
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Szűrés a Firebase figyelmeztetésekre
      if (message.includes('Firebase')) {
        // Nem jelenítjük meg a Firebase figyelmeztetéseket
        return;
      }
      
      // Minden más figyelmeztetést megjelenítünk
      this.originalConsole.warn(...args);
    };
  }
}