import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, MatButtonModule ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;
  loginError = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  googleLogin(): void {
    this.isLoading = true;
    this.loginError = '';
    this.authService.loginWithGoogle()
      .then(() => {
        // Az átirányítás sikeresen elindult, a bejelentkezés eredményét az AuthService kezeli
        // Itt nem feltétlenül kell semmit tenni, vagy megjeleníthetsz egy üzenetet a felhasználónak.
        console.log('Google Sign-In redirect started.');
        // A router navigációt az AuthService kezeli.
      })
      .catch(error => {
        this.isLoading = false;
        this.loginError = 'Google Sign-In failed. Please try again.';
        console.error('Google Sign-In failed:', error);
      });
  }
}