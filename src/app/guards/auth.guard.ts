// src/app/guards/auth.guard.ts (Placeholder - Based on error message)

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service'; // Import your AuthService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // JAVÍTVA: Helyes Observable név használata az AuthService-ből
    return this.authService.currentUserProfile$.pipe(
      take(1), // Csak az első értéket vesszük figyelembe
      map(user => {
        if (user) {
          return true; // A felhasználó be van jelentkezve, engedélyezzük az útvonalat
        } else {
          // A felhasználó nincs bejelentkezve, átirányítjuk a bejelentkezési oldalra
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError((error: any) => { // JAVÍTVA: Explicit any type
        console.error('AuthGuard hiba:', error);
        this.router.navigate(['/login']);
        return of(false); // Hiba esetén is letiltjuk az útvonalat
      })
    );
  }
}

// Szükség lehet az 'of' importálására is
import { of } from 'rxjs';
