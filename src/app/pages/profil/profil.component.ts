import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../../firebase.service';
import { User } from '../../services/interfaces';
import { takeUntil, tap } from 'rxjs/operators'; // tap hozzáadva a betöltéskezeléshez
import { Subject } from 'rxjs'; // Subject hozzáadva a leiratkozáshoz

// Angular Material modulok
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar'; // MatSnackBar hozzáadva

@Component({
  selector: 'app-profil',
  standalone: true,
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class ProfilComponent implements OnInit {
  currentUser: User | null = null;
  profileForm!: FormGroup;
  isLoading: boolean = true; // Alapértelmezetten true, amíg betöltődnek az adatok
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>(); // Leiratkozáshoz

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar // MatSnackBar injektálása
  ) { }

  ngOnInit(): void {
    // FormGroup inicializálása az összes mezővel, a rendelésszám disabled
    this.profileForm = this.formBuilder.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      nev: ['', [Validators.required, Validators.minLength(2)]],
      jelszo: ['', [Validators.minLength(6)]],
      rendelesekSzama: [{ value: 0, disabled: true }] // Rendelésszám disabled és alapértelmezett értékkel
    });

    // Felhasználó adatainak figyelése
    this.authService.currentUserProfile$.pipe(
      tap(user => {
        // Amikor új felhasználói adat érkezik, beállítjuk a formot és befejezzük a betöltést
        this.currentUser = user;
        if (user) {
          this.profileForm.patchValue({
            email: user.email,
            nev: user.nev,
            rendelesekSzama: user.rendelesekSzama || 0 // Biztosítjuk, hogy 0 legyen, ha nincs adat
          });
          this.isLoading = false; // Adatok betöltve, kikapcsoljuk a betöltést
        } else {
          // Ha nincs felhasználó (pl. kijelentkezett), visszaállítjuk az alapállapotot
          this.profileForm.reset();
          this.isLoading = false;
          this.router.navigate(['/login']); // Átirányítás a bejelentkezésre
        }
      }),
      takeUntil(this.destroy$) // Leiratkozás a komponens megsemmisülésekor
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSubmit(): Promise<void> {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });

    if (this.profileForm.invalid) {
      this.snackBar.open('Kérlek, javítsd a formon lévő hibákat.', 'OK', { duration: 3000 });
      return;
    }

    if (!this.currentUser || !this.currentUser.email) {
      this.snackBar.open('Nincs bejelentkezett felhasználó.', 'OK', { duration: 3000 });
      return;
    }

    const { nev, jelszo } = this.profileForm.getRawValue(); // getRawValue a disabled mezőket is lekéri
    this.isLoading = true;
    this.errorMessage = null; // Hibaüzenet törlése

    try {
      // Név frissítése, ha megváltozott
      if (nev !== this.currentUser.nev) {
        await this.firebaseService.updateUserName(this.currentUser.email, nev).toPromise();
        console.log('Név sikeresen frissítve a Firestore-ban.');
        // Alkalmazás állapot frissítése
        if (this.currentUser) this.currentUser.nev = nev;
      }

      // Jelszó frissítése (csak ha meg van adva új jelszó)
      if (jelszo) {
        // Itt kellene a Firebase Authentication updatePassword metódusát hívni
        // Pl: await updatePassword(this.authService.auth.currentUser, jelszo);
        // Fontos: ehhez újra kell hitelesíteni a felhasználót biztonsági okokból
        console.warn('Jelszó frissítés nincs implementálva a demóban.');
        this.snackBar.open('Jelszó frissítés nincs implementálva.', 'OK', { duration: 3000 });
        // throw new Error('Jelszó frissítés nincs implementálva.'); // Vagy dobj hibát
      }

      // Frissítjük a felhasználót az AuthService-ben is, ami frissíti a localStorage-t
      // Ez fontos, hogy a rendelésszám növelés is frissítse a UI-t
      if (this.currentUser) {
        this.authService.setUser({ ...this.currentUser }); // Új objektumot adunk át a változás érzékeléséhez
      }

      console.log('Profil sikeresen frissítve.');
      this.snackBar.open('Profil sikeresen frissítve!', 'OK', { duration: 3000 });

    } catch (error: any) {
      console.error('Hiba a profil frissítésekor:', error);
      this.errorMessage = error.message || 'Hiba történt a profil frissítése során.';
      this.snackBar.open("", 'OK', { duration: 3000 });
    } finally {
      this.isLoading = false;
      // Jelszó mező ürítése biztonsági okokból
      this.profileForm.get('jelszo')?.reset();
    }
  }

  navigateToOrders(): void {
    this.router.navigate(['/rendeleslistaz']);
  }

  logout(): void {
    this.authService.logout();
  }
}
