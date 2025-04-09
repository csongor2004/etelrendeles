import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Etel, KosarTetel, Rendeles, User } from './services/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  // Ételek lekérése
  getEtelek(): Observable<Etel[]> {
    const etelek = collection(this.firestore, 'etelek');
    return from(getDocs(etelek)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: data['id'] || parseInt(doc.id), 
            nev: data['nev'] || '',
            ar: data['ar'] || 0,
            kep: data['kep'] || ''
          } as Etel;
        })
      )
    );
  }

  // Felhasználó lekérése email alapján
  getUser(email: string): Observable<User | null> {
    const users = collection(this.firestore, 'users');
    return from(getDocs(users)).pipe(
      map(snapshot => {
        const userDoc = snapshot.docs.find(doc => doc.data()['email'] === email);
        if (!userDoc) return null;
        
        const data = userDoc.data();
        return {
          email: data['email'] || '',
          nev: data['name'] || '',  // Itt javítottam name mezőnév
          rendelesekSzama: data['rendelesek_szama'] || 0,  // Itt javítottam mezőnevet
          profilkep: data['photoURL'] || ''  // Itt javítottam photoURL mezőnevet
        } as User;
      })
    );
  }

  // Rendelés mentése
  rendelesMentese(tetelek: KosarTetel[], osszeg: number, email: string): Observable<string> {
    const rendelesek = collection(this.firestore, 'rendelesek');
    const rendeles = {
      rendelo: email,
      ar: osszeg,
      datum: new Date()
    };

    return from(addDoc(rendelesek, rendeles)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Rendelés státuszának frissítése
  rendelesStatuszFrissites(rendelesId: string, ujStatusz: string): Observable<void> {
    const rendelesRef = doc(this.firestore, 'rendelesek', rendelesId);
    return from(updateDoc(rendelesRef, { statusz: ujStatusz }));
  }

  // Név frissitése
  updateUserName(email: string, newName: string): Observable<void> {
    const users = collection(this.firestore, 'users');
    return from(getDocs(users)).pipe(
      switchMap(snapshot => {
        const userDoc = snapshot.docs.find(doc => doc.data()['email'] === email);
        if (!userDoc) throw new Error('Felhasználó nem található');
        
        const userRef = doc(this.firestore, 'users', userDoc.id);
        return from(updateDoc(userRef, { name: newName }));  // Itt javítottam name mezőnevet
      })
    );
  }

  // Rendelés törlése
  rendelesTorles(rendelesId: string): Observable<void> {
    const rendelesRef = doc(this.firestore, 'rendelesek', rendelesId);
    return from(deleteDoc(rendelesRef));
  }

  // Rendelésszám növelés
  novelRendelesSzam(email: string): Observable<void> {
    const users = collection(this.firestore, 'users');
    return from(getDocs(users)).pipe(
      switchMap(snapshot => {
        const userDoc = snapshot.docs.find(doc => doc.data()['email'] === email);
        if (!userDoc) throw new Error('Felhasználó nem található');

        const userRef = doc(this.firestore, 'users', userDoc.id);
        const ujRendelesSzam = userDoc.data()['rendelesek_szama'] + 1;  // Itt javítottam mezőnevet
        return from(updateDoc(userRef, { rendelesek_szama: ujRendelesSzam }));
      })
    );
  }
}