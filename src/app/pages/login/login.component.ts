// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email, password);
      // Sikeres bejelentkezés után az AuthService irányít át
    } catch (error: any) {
      console.error('Hiba a bejelentkezés során:', error);
      this.errorMessage = 'Hibás email cím vagy jelszó.';
    } finally {
      this.loading = false;
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}