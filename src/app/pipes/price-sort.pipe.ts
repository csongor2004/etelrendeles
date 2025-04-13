import { Pipe, PipeTransform } from '@angular/core';

// Generic interface for anything with an 'ar' property
interface ArInterface {
  ar: number;
  [key: string]: any; // Allow any other properties
}

@Pipe({
  name: 'priceSort',
  standalone: true
})
export class PriceSortPipe implements PipeTransform {
  transform<T extends ArInterface>(items: T[], ascending: boolean = true): T[] {
    if (!items || items.length === 0) return [];
    
    return [...items].sort((a, b) => {
      if (ascending) {
        return a.ar - b.ar;
      } else {
        return b.ar - a.ar;
      }
    });
  }
}