import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Etel {
  id: number;
  nev: string;
  ar: number;
  kep: string;
}

@Component({
  selector: 'app-food-item',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button mat-raised-button color="primary" (click)="rendelesGombKattintas()">
      <mat-icon>add_shopping_cart</mat-icon>
      Rendelés
    </button>
  `,
  styles: []
})
export class FoodItemComponent {
  @Input() etel!: Etel;
  @Output() rendelesEsemeny = new EventEmitter<Etel>();

  rendelesGombKattintas(): void {
    this.rendelesEsemeny.emit(this.etel);
  }
}