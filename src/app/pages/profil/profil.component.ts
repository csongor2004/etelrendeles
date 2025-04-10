// src/app/pages/profil/profil.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { User } from '../../services/interfaces';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log("ProfilComponent initializing...");

    this.authService.currentUserProfile$.subscribe({
      next: (user: User | null) => {
        console.log("User data received:", user);

        if (!user) {
          console.log("No user data, redirecting to login");
          this.router.navigate(['/login']);
          return;
        }

        this.currentUser = user;
        this.initForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error fetching user data:", error);
        this.isLoading = false;
      }
    });
  }

  initForm(): void {
    if (!this.currentUser) {
      console.log("Cannot initialize form: current user is null");
      return;
    }

    console.log("Initializing form with user data:", this.currentUser);

    this.profileForm = this.fb.group({
      email: [{ value: this.currentUser.email, disabled: true }],
      nev: [this.currentUser.nev, [Validators.required, Validators.minLength(3)]],
      jelszo: ['', [Validators.minLength(6)]], // Hozzáadtuk a jelszó mezőt
      rendelesekSzama: [{ value: this.currentUser.rendelesekSzama, disabled: true }]
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      console.log("Form is invalid, not submitting");
      return;
    }

    const newName = this.profileForm.get('nev')?.value;
    const newPassword = this.profileForm.get('jelszo')?.value;

    if (this.currentUser && this.currentUser.email && newName) {
      console.log("Submitting form with new name:", newName);
      this.isLoading = true;

      this.authService.updateUserName(this.currentUser.email, newName)
        .then(() => {
          console.log("Name updated successfully");
          this.snackBar.open('A név sikeresen frissítve!', 'OK', { duration: 3000 });
          // Itt lehetne kezelni a jelszó frissítését is, ha a newPassword nem üres
          if (newPassword) {
            console.log("Új jelszó megadva, a jelszófrissítés implementálása itt történhet.");
            this.snackBar.open('A jelszó frissítésének implementálása itt történhet meg.', 'Figyelem!', { duration: 5000 });
            // **Fontos:** A jelszó frissítéséhez további logika szükséges a Firebase Auth-ban.
          }
          this.isLoading = false;
        })
        .catch(error => {
          console.error('Hiba történt a név frissítésekor:', error);
          this.snackBar.open('Hiba történt a név frissítésekor', 'OK', { duration: 3000 });
          this.isLoading = false;
        });
    }
  }

  navigateToOrders(): void {
    this.router.navigate(['/rendeleslistaz']);
  }

  logout(): void {
    this.authService.logout();
  }
}