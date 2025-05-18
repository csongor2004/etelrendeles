import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  increment,
  CollectionReference,
  Query,
  DocumentData,
} from '@angular/fire/firestore';

import { Observable, from, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Etel, KosarTetel, Rendeles, User } from './app/services/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: Firestore) {}

  getEtelek(): Observable<Etel[]> {
    const etelekRef = collection(this.firestore, 'etelek');
    return from(getDocs(etelekRef)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: data['id'] ?? 0,
            nev: data['nev'] ?? '',
            ar: data['ar'] ?? 0,
            kep: data['kep'] ?? ''
          } as Etel;
        })
      )
    );
  }

  getUser(email: string): Observable<User | null> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const userDoc = snapshot.docs[0];
        const data = userDoc.data();

        return {
          email: data['email'] ?? '',
          nev: data['name'] ?? '',
          rendelesekSzama: data['rendelesek_szama'] ?? 0,
          profilkep: data['photoURL'] ?? '',
          uid: userDoc.id
        } as User;
      })
    );
  }

  rendelesMentese(osszeg: number, email: string): Observable<string> {
    const rendelesekRef = collection(this.firestore, 'rendelesek');
    const rendeles = {
      rendelo: email,
      ar: osszeg,
      datum: new Date()
    };
    return from(addDoc(rendelesekRef, rendeles)).pipe(map(docRef => docRef.id));
  }

  rendelesStatuszFrissites(rendelesId: string, ujStatusz: string): Observable<void> {
    const rendelesRef = doc(this.firestore, 'rendelesek', rendelesId);
    return from(updateDoc(rendelesRef, { statusz: ujStatusz }));
  }

  updateUserName(email: string, newName: string): Observable<void> {
    return this.getUser(email).pipe(
      switchMap(user => {
        if (!user?.uid) return throwError(() => new Error('Felhasználó nem található vagy nincs UID'));
        const userRef = doc(this.firestore, 'users', user.uid);
        return from(updateDoc(userRef, { name: newName }));
      })
    );
  }

  rendelesTorles(rendelesId: string): Observable<void> {
    const rendelesRef = doc(this.firestore, 'rendelesek', rendelesId);
    return from(deleteDoc(rendelesRef));
  }

  novelRendelesSzam(email: string): Observable<void> {
    return this.getUser(email).pipe(
      switchMap(user => {
        if (!user?.uid) return throwError(() => new Error('Felhasználó nem található vagy nincs UID'));
        const userRef = doc(this.firestore, 'users', user.uid);
        return from(updateDoc(userRef, { rendelesek_szama: increment(1) }));
      })
    );
  }

  getRendelesekByEmailAndDateSorted(email: string): Observable<Rendeles[]> {
    const rendelesekRef = collection(this.firestore, 'rendelesek');
    const q = query(rendelesekRef, where('rendelo', '==', email), orderBy('datum', 'desc'));

    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => {
          const data = doc.data();
          const datum = this.convertTimestampToDate(data['datum']);
          return {
            email: data['rendelo'] ?? '',
            osszeg: data['ar'] ?? 0,
            datum
          } as Rendeles;
        })
      )
    );
  }

  getLatestNRendelesekByEmail(email: string, n: number): Observable<Rendeles[]> {
    const rendelesekRef = collection(this.firestore, 'rendelesek');
    const q = query(
      rendelesekRef,
      where('rendelo', '==', email),
      orderBy('datum', 'desc'),
      limit(n)
    );

    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => {
          const data = doc.data();
          const datum = this.convertTimestampToDate(data['datum']);
          return {
            email: data['rendelo'] ?? '',
            osszeg: data['ar'] ?? 0,
            datum
          } as Rendeles;
        })
      )
    );
  }

  getPaginatedRendelesekByEmail(
    email: string,
    n: number,
    lastDoc?: DocumentSnapshot<DocumentData>
  ): Observable<{ rendelesek: Rendeles[]; lastDoc?: DocumentSnapshot<DocumentData> }> {
    const rendelesekRef = collection(this.firestore, 'rendelesek');
    const baseQuery: Query<DocumentData> = lastDoc
      ? query(
          rendelesekRef,
          where('rendelo', '==', email),
          orderBy('datum', 'desc'),
          startAfter(lastDoc),
          limit(n)
        )
      : query(
          rendelesekRef,
          where('rendelo', '==', email),
          orderBy('datum', 'desc'),
          limit(n)
        );

    return from(getDocs(baseQuery)).pipe(
      map(snapshot => {
        const rendelesek = snapshot.docs.map(doc => {
          const data = doc.data();
          const datum = this.convertTimestampToDate(data['datum']);
          return {
            email: data['rendelo'] ?? '',
            osszeg: data['ar'] ?? 0,
            datum
          } as Rendeles;
        });
        const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : undefined;
        return { rendelesek, lastDoc: newLastDoc };
      })
    );
  }

  private convertTimestampToDate(timestamp: any): Date {
    return timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date();
  }
}
