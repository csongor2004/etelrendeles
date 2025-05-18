import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc } from '@angular/fire/firestore'; // doc és getDoc hozzáadva
import { Observable, from } from 'rxjs'; // from hozzáadva
import { map } from 'rxjs/operators'; // map hozzáadva
import { User } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);

  fetchUsersFromFirebase(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'uid' }) as Observable<User[]>;
  }

  // Új metódus egyetlen felhasználó lekérésére UID alapján
  getUserById(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            email: data['email'] || '',
            nev: data['name'] || '',
            rendelesekSzama: data['rendelesek_szama'] || 0,
            profilkep: data['photoURL'] || '',
            uid: docSnap.id
          } as User;
        } else {
          return null;
        }
      })
    );
  }
}
