import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, increment, collection, query, where, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';
import { User } from './interfaces'; // Import User interface

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  incrementOrderCountForCurrentUser(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authService.currentUserProfile$.pipe(take(1)).subscribe(user => {
        if (user && user.uid) { // Ellenőrizzük az UID meglétét
          const userRef = doc(this.firestore, 'users', user.uid);

          // Rendelésszám növelése
          updateDoc(userRef, {
            rendelesek_szama: increment(1)
          }).then(() => {
            // Alkalmazás állapot frissítése is az AuthService-en keresztül
            // Lekérjük a frissített felhasználói adatokat a Firestore-ból az UID alapján
            this.authService.getUserById(user.uid!).pipe(take(1)).subscribe((updatedUser: User | null) => { // Explicit típus
              if (updatedUser) {
                this.authService.setUser(updatedUser);
                console.log("Rendelésszám növelve és frissítve:", updatedUser.rendelesekSzama);
              } else {
                console.warn("Rendelésszám növelve, de a felhasználó frissítése sikertelen.");
              }
              resolve(); // Mindig feloldjuk a Promise-t a Firestore frissítés után
            });
          }).catch(error => {
            console.error("Hiba a rendelésszám növelésekor:", error);
            reject(error);
          });
        } else {
          const error = "Nincs bejelentkezett felhasználó vagy hiányzik az UID a rendelésszám növeléséhez";
          console.error(error);
          reject(error);
        }
      });
    });
  }
}
