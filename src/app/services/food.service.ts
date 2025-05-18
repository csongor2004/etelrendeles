// src/app/services/food.service.ts

import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { FirebaseService } from '../../firebase.service';

import { AuthService } from './auth.service';

import { Etel, KosarTetel, User } from './interfaces';

import { Firestore, collection, doc, updateDoc } from '@angular/fire/firestore';

import { take, switchMap } from 'rxjs/operators';



@Injectable({

  providedIn: 'root'

})

export class FoodService {

  constructor(

    private firebaseService: FirebaseService,

    private authService: AuthService,

    private firestore: Firestore

  ) {}



  getEtelek(): Observable<Etel[]> {

    return this.firebaseService.getEtelek();

  }



  getCurrentUser(): Observable<User | null> {

    return this.authService.currentUserProfile$;

  }


  // JAVÍTVA: Hívja a FirebaseService-t a rendelés mentéséhez a tételek NÉLKÜL
  addOrderToFirebase(tetelek: KosarTetel[], totalAmount: number): Observable<void> {

    return this.authService.currentUserProfile$.pipe(

      take(1),

      switchMap(user => {

        if (!user?.email) throw new Error('Be kell jelentkezni');


        // Hívjuk a FirebaseService rendelesMentese metódusát a tételek NÉLKÜL
        // Az interface kérésnek megfelelően csak az összeg és email kerül átadásra.
        return this.firebaseService.rendelesMentese(totalAmount, user.email); // Eltávolítva a 'tetelek' paraméter

      }),

      switchMap(() => of(undefined)) // Konvertáljuk a string Observable-t void Observable-re

    );

  }

}
