import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface FirebaseUser {
  email: string;
  jelszo: string;
  name: string;
  photoURL: string;
  rendelesek_szama: number;
  uid?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);

  fetchUsersFromFirebase(): Observable<FirebaseUser[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'uid' }) as Observable<FirebaseUser[]>;
  }
}