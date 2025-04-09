// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, increment, collection, query, where, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';

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
        if (user && user.email) {
          // Find the user document by email
          const usersRef = collection(this.firestore, 'users');
          const q = query(usersRef, where("email", "==", user.email));
          
          getDocs(q).then(snapshot => {
            if (!snapshot.empty) {
              const userDoc = snapshot.docs[0];
              const userRef = doc(this.firestore, 'users', userDoc.id);
              
              // Increment the orders count
              updateDoc(userRef, { 
                rendelesek_szama: increment(1) 
              }).then(() => {
                // Also update the user in the app state
                const updatedUser = {
                  ...user,
                  rendelesekSzama: (user.rendelesekSzama || 0) + 1
                };
                
                this.authService.setUser(updatedUser);
                console.log("Order count incremented successfully:", updatedUser.rendelesekSzama);
                resolve();
              }).catch(error => {
                console.error("Error incrementing order count:", error);
                reject(error);
              });
            } else {
              const error = "User document not found";
              console.error(error);
              reject(error);
            }
          }).catch(error => {
            console.error("Error finding user document:", error);
            reject(error);
          });
        } else {
          const error = "User not logged in or email is missing";
          console.error(error);
          reject(error);
        }
      });
    });
  }
}