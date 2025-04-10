import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  registerError = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rePassword: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    });
  }

  async register(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerError = 'Kérlek, javítsd a formon lévő hibákat.';
      return;
    }
    const password = this.registerForm.get('password')?.value;
    const rePassword = this.registerForm.get('rePassword')?.value;
    if (password !== rePassword) {
      this.registerError = 'A jelszavak nem egyeznek!';
      return;
    }

    this.isLoading = true;
    this.registerError = '';
    const { email, name } = this.registerForm.value;

    try {
      await this.authService.register(email, password, name);
      this.router.navigateByUrl('/login'); // Sikeres regisztráció után a bejelentkezési oldalra irányít
    } catch (error: any) {
      console.error('Hiba a regisztráció során:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.registerError = 'Ez az email cím már használatban van.';
      } else {
        this.registerError = 'Hiba a regisztráció során. Próbáld újra később.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  navigateToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}