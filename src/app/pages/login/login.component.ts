import { Component } from '@angular/core';
// Importáljuk a szükséges modulokat
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Importáljuk a javított AuthService-t
import { AuthService } from '../../services/auth.service';

// Angular Material modulok
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true, // Fontos: standalone komponens
  imports: [
    CommonModule, // Biztosítjuk, hogy a CommonModule importálva van a *ngIf-hez
    ReactiveFormsModule, // Biztosítjuk, hogy a ReactiveFormsModule importálva van a formGroup-hoz
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService, // Injektáljuk a javított AuthService-t
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  // A login metódus most a komponensben kezeli az átirányítást
  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    const { email, password } = this.loginForm.value;

    try {
      // Hívjuk az AuthService login metódusát, ami most csak a sikeres/sikertelen státuszt adja vissza (boolean)
      const loginSuccessful = await this.authService.login(email, password);

      if (loginSuccessful) {
        console.log('Bejelentkezés sikeres a komponensben, átirányítás a főoldalra.');
        // JAVÍTVA: Átirányítás a /home útvonalra a sikeres bejelentkezés után
        this.router.navigate(['/home']);
      } else {
        // Az AuthService login metódusa már logolja a hibát, itt csak az üzenetet állítjuk be
        this.errorMessage = 'Hibás email cím vagy jelszó.'; // Vagy specifikusabb üzenet, ha az AuthService ad vissza ilyet
      }
    } catch (error: any) {
      // Ez a catch blokk akkor fut le, ha az AuthService.login dobott egy nem kezelt hibát
      console.error('Bejelentkezési hiba a komponensben:', error);
      this.errorMessage = error.message || 'Váratlan hiba történt a bejelentkezés során.';
    } finally {
      this.loading = false;
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
