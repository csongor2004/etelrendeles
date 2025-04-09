import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { OrderService } from '../../services/order.service'; 
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CommonModule, MatButtonModule ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
    private orderService: OrderService // Ennek most már működnie kell
  ) {}

  logout(): void {
    this.authService.logout()
      .then(() => {
        this.router.navigateByUrl('/login');
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
  }

  simulateOrder(): void {
    this.orderService.incrementOrderCountForCurrentUser();
  }
}