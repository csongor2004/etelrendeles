// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FomenuComponent } from './shared/fomenu/fomenu.component';
import { AuthService } from './services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FomenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentRoute: string = '';
  title: string = 'Rendelés';
  showMenu: boolean = false; // Kezdetben ne jelenjen meg a menü

  constructor(public authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      // Csak akkor mutassuk a menüt, ha a felhasználó be van jelentkezve ÉS nem a login vagy register oldalon van
      this.authService.currentUserProfile$.subscribe(user => {
        this.showMenu = !!user && this.currentRoute !== '/login' && this.currentRoute !== '/register';
      });
    });
  }

  ngOnInit(): void {
    // Az alkalmazás indításakor ellenőrizzük, hogy a felhasználó be van-e jelentkezve
    this.authService.currentUserProfile$.pipe(take(1)).subscribe(user => {
      if (!user && this.router.url !== '/login' && this.router.url !== '/register') {
        this.router.navigate(['/login']);
      } else if (user && (this.router.url === '/login' || this.router.url === '/register')) {
        this.router.navigate(['/home']); // Ha be van jelentkezve és a login/register oldalon van, irányítsuk át a főoldalra
      }
    });
  }
}