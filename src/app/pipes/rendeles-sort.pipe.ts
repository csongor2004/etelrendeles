import { Pipe, PipeTransform } from '@angular/core';

interface Rendeles {
  id: string;
  rendelo: string;
  ar: number;
  datum: Date;
}

@Pipe({
  name: 'rendelesSort',
  standalone: true
})
export class RendelesSortPipe implements PipeTransform {
  transform(rendelesek: Rendeles[], ascending: boolean = true): Rendeles[] {
    if (!rendelesek || rendelesek.length === 0) return [];
    
    return [...rendelesek].sort((a, b) => {
      if (ascending) {
        return a.ar - b.ar;
      } else {
        return b.ar - a.ar;
      }
    });
  }
}