// src/app/shared/fomenu/fomenu.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-fomenu',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
  templateUrl: './fomenu.component.html',
  styleUrls: ['./fomenu.component.css']
})
export class FomenuComponent {
  // A menü automatikusan betöltődik amikor a komponens inicializálódik
}