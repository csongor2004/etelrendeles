import { Pipe, PipeTransform } from '@angular/core';
import { Rendeles } from '../services/interfaces';

@Pipe({
  name: 'rendelesSort',
  standalone: true
})
export class RendelesSortPipe implements PipeTransform {
  transform(rendelesek: Rendeles[], ascending: boolean = true): Rendeles[] {
    if (!rendelesek || rendelesek.length === 0) return [];

    return [...rendelesek].sort((a, b) => {
      if (ascending) {
        return a.osszeg - b.osszeg;
      } else {
        return b.osszeg - a.osszeg;
      }
    });
  }
}
