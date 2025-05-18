import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, Etel, KosarTetel, Rendeles } from '../../services/interfaces';
import { FoodService } from '../../services/food.service';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KosarComponent } from '../kosar/kosar.component';
import { PriceSortPipe } from '../../pipes/price-sort.pipe';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-rendeles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    FormsModule,
    KosarComponent,
    PriceSortPipe
  ],
  templateUrl: './rendeles.component.html',
  styleUrls: ['./rendeles.component.css']
})
export class RendelesComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;
  etelek: Etel[] = [];
  kosarTetelek: KosarTetel[] = [];
  sortAscending = true;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private foodService: FoodService,
    private orderService: OrderService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.authService.currentUserProfile$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (!user) {
        this.snackBar.open('Be kell jelentkezni a rendeléshez', 'OK', { duration: 3000 });
        this.router.navigate(['/login']);
      }
    });

    this.loadEtelek();
  }

  loadEtelek(): void {
    this.isLoading = true;
    this.foodService.getEtelek().subscribe({
      next: (etelek) => {
        this.etelek = etelek;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Hiba az ételek betöltésekor:', error);
        this.snackBar.open('Hiba az ételek betöltésekor', 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  etelHozzaadas(etel: Etel): void {
    const existingIndex = this.kosarTetelek.findIndex(item => item.id === etel.id);

    if (existingIndex > -1) {
      const updatedKosarTetelek = [...this.kosarTetelek];
      updatedKosarTetelek[existingIndex] = {
        ...updatedKosarTetelek[existingIndex],
        mennyiseg: updatedKosarTetelek[existingIndex].mennyiseg + 1
      };
      this.kosarTetelek = updatedKosarTetelek;
      this.snackBar.open(`${etel.nev} mennyisége növelve a kosárban`, 'OK', { duration: 1000 });
    } else {
      const ujTetel: KosarTetel = {
        id: etel.id,
        nev: etel.nev,
        ar: etel.ar,
        mennyiseg: 1
      };
      this.kosarTetelek = [...this.kosarTetelek, ujTetel];
      this.snackBar.open(`${etel.nev} hozzáadva a kosárhoz`, 'OK', { duration: 1000 });
    }
  }

  tetelTorlese(id: number): void {
    this.kosarTetelek = this.kosarTetelek.filter(tetel => tetel.id !== id);
  }

  tetelMennyisegValtozas(event: { id: number; mennyiseg: number }): void {
    this.kosarTetelek = this.kosarTetelek.map(tetel =>
      tetel.id === event.id ? { ...tetel, mennyiseg: event.mennyiseg } : tetel
    );
  }

  rendelesTeljesites(tetelek: KosarTetel[]): void {
    if (tetelek.length === 0) {
      this.snackBar.open('A kosár üres', 'OK', { duration: 3000 });
      return;
    }

    if (!this.currentUser?.email) {
      this.snackBar.open('Nincs bejelentkezett felhasználó a rendeléshez', 'OK', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const osszeg = tetelek.reduce((sum, item) => sum + (item.ar * item.mennyiseg), 0);

    // Hívjuk a FoodService metódusát a rendelés mentéséhez.
    // A FoodService továbbítja a hívást a FirebaseService-nek, ami csak az összeget és emailt menti a Rendeles interface alapján.
    this.foodService.addOrderToFirebase(tetelek, osszeg).subscribe({
      next: () => {
        // Rendelésszám növelése a felhasználónál a sikeres rendelés után
        this.orderService.incrementOrderCountForCurrentUser()
          .then(() => {
            this.snackBar.open('Rendelés sikeresen leadva!', 'OK', {});
            this.kosarTetelek = []; // Ürítjük a kosarat sikeres rendelés után
            this.isLoading = false;
          })
          .catch(error => {
            console.error('Hiba a rendelésszám növelésekor:', error);
            this.snackBar.open('Rendelés leadva, de a rendelésszám frissítése sikertelen', 'OK', {});
            this.kosarTetelek = []; // Kosár ürítése hiba esetén is
            this.isLoading = false;
          });
      },
      error: (error) => {
        console.error('Hiba a rendelés leadásakor:', error);
        this.snackBar.open('Hiba a rendelés leadásakor', 'OK', {});
        this.isLoading = false;
      }
    });
  }

  sortingChanged(): void {
    this.ngZone.run(() => {
      this.etelek = [...this.etelek];
    });
  }
}
