import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FomenuComponent } from './shared/fomenu/fomenu.component';
import { AuthService } from './services/auth.service';
import { ConsoleOverrideService } from './services/console-override.service';
import { filter, take } from 'rxjs/operators';
import { UserService } from './services/user.service';

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
  showMenu: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private consoleOverride: ConsoleOverrideService,
    private userService: UserService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      this.authService.currentUserProfile$.subscribe(user => {
        this.showMenu = !!user && this.currentRoute !== '/login' && this.currentRoute !== '/register';
      });
    });
  }

  // Eseményfigyelő az ablak bezárására/frissítésére
  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    // Kijelentkeztetjük a felhasználót
    this.authService.logout();
  }

  ngOnInit(): void {
    this.authService.currentUserProfile$.pipe(take(1)).subscribe(user => {
      if (!user && this.router.url !== '/login' && this.router.url !== '/register') {
        this.router.navigate(['/login']);
      } else if (user && (this.router.url === '/login' || this.router.url === '/register')) {
        this.router.navigate(['/home']);
      }
    });

    this.userService.fetchUsersFromFirebase().subscribe(users => {
      // Felhasználók betöltése FireBase-ből
    });
  }
}