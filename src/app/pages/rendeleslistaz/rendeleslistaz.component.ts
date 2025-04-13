import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { PriceSortPipe } from '../../pipes/price-sort.pipe';
import { NgZone } from '@angular/core';

interface Rendeles {
  id: string;
  rendelo: string;
  ar: number;
  datum: Date;
}

@Component({
  selector: 'app-rendeleslistaz',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    FormsModule,
    PriceSortPipe
  ],
  templateUrl: './rendeleslistaz.component.html',
  styleUrl: './rendeleslistaz.component.css'
})
export class RendeleslistazComponent implements OnInit {
  rendelesek: Rendeles[] = [];
  isLoading = false;
  sortAscending = true;
  currentUserEmail: string = '';

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.authService.currentUserProfile$.subscribe(user => {
      if (!user) {
        this.snackBar.open('Be kell jelentkezni a rendelések megtekintéséhez', 'OK', { duration: 3000 });
        this.router.navigate(['/login']);
      } else {
        this.currentUserEmail = user.email;
        this.loadRendelesek();
      }
    });
  }

  loadRendelesek(): void {
    this.isLoading = true;
    const rendelesekRef = collection(this.firestore, 'rendelesek');
    const q = query(rendelesekRef, where('rendelo', '==', this.currentUserEmail));

    getDocs(q).then(snapshot => {
      this.rendelesek = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          rendelo: data['rendelo'] || '',
          ar: data['ar'] || 0,
          datum: data['datum'] ? new Date(data['datum'].seconds * 1000) : new Date()
        };
      });
      this.isLoading = false;
    }).catch(error => {
      console.error('Hiba a rendelések betöltésekor:', error);
      this.snackBar.open('Hiba a rendelések betöltésekor', 'OK', { duration: 3000 });
      this.isLoading = false;
    });
  }
  
  sortingChanged(): void {
    // Force change detection on the array
    this.ngZone.run(() => {
      this.rendelesek = [...this.rendelesek];
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleString('hu-HU');
  }
}