import { Component, OnInit } from '@angular/core';
// Importáljuk a szükséges modulokat
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Hozzáadva FormBuilder
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Angular Material modulok
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true, // Hozzáadva standalone: true
  templateUrl: './register.component.html',
  // JAVÍTVA: Stylesheet fájl kiterjesztése .css-re
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule, // Biztosítjuk, hogy a CommonModule importálva van a *ngIf-hez
    ReactiveFormsModule, // Biztosítjuk, hogy a ReactiveFormsModule importálva van a formGroup-hoz
    MatFormFieldModule, // Angular Material form field
    MatInputModule, // Angular Material input
    MatButtonModule, // Angular Material button
    // RouterModule // Ha útválasztás szükséges a template-ben, akkor kellhet
  ]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup; // Használjuk a non-null assertion operátort
  registerError: string = '';
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder, // Injektáljuk a FormBuilder-t
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // FormGroup inicializálása FormBuilderrel
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rePassword: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]]
    }, {
      // Hozzáadjuk a jelszó egyezés validátort a FormGroup szinten
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator for password matching
  private passwordMatchValidator(form: FormGroup) {
    const passwordControl = form.get('password');
    const rePasswordControl = form.get('rePassword');

    if (!passwordControl || !rePasswordControl) {
      return null; // Controls not found
    }

    if (rePasswordControl.errors && !rePasswordControl.errors['passwordMismatch']) {
      return null; // Don't validate if there are other errors
    }

    if (passwordControl.value !== rePasswordControl.value) {
      rePasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      rePasswordControl.setErrors(null); // Clear the error if they match
      return null;
    }
  }


  async register() {
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

    if (this.registerForm.invalid) {
       // Ellenőrizzük a jelszó egyezés hibát külön is, ha van más hiba is
       if (this.registerForm.hasError('passwordMismatch')) {
          this.registerError = 'A jelszavak nem egyeznek meg.';
       } else {
          this.registerError = 'Kérlek, javítsd a formon lévő hibákat.';
       }
      return;
    }

    // Jelszó egyezés ellenőrzése (ha a validátor nem volt elég)
    const password = this.registerForm.get('password')?.value;
    const rePassword = this.registerForm.get('rePassword')?.value;
    if (password !== rePassword) {
       this.registerError = 'A jelszavak nem egyeznek meg.';
       return;
    }


    const { email, password: pwd, name } = this.registerForm.value;

    this.isLoading = true;
    this.registerError = '';

    try {
      // Hívjuk a javított AuthService register metódusát, ami Promise-t ad vissza
      const result = await this.authService.register(email, pwd, name);

      // Kezeljük a register metódus által visszaadott eredményt
      if (result.success) {
        console.log('Regisztráció sikeres:', result.message);
        this.router.navigate(['/login']); // Sikeres regisztráció után a bejelentkezési oldalra irányít
      } else {
        console.error('Regisztráció sikertelen:', result.message);
        this.registerError = result.message; // Jelenítsük meg a hibaüzenetet a felhasználónak
      }

    } catch (error: any) {
      // Ez a catch blokk akkor fut le, ha az AuthService.register dobott egy nem kezelt hibát
     
      this.registerError = error.message || 'Hiba történt a regisztráció során.';
    } finally {
      this.isLoading = false;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
