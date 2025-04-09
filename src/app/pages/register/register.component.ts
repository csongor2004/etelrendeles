import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rePassword: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    });
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerError = 'Please correct the form errors before submitting.';
      return;
    }
    const password = this.registerForm.get('password')?.value;
    const rePassword = this.registerForm.get('rePassword')?.value;
    if (password !== rePassword) {
      this.registerError = 'Passwords do not match!';
      return;
    }
    const newUser = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (existingUsers.some((u: any) => u.email === newUser.email)) {
      this.registerError = 'Email already exists!';
      return;
    }
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    this.router.navigateByUrl('/login');
  }

  navigateToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
