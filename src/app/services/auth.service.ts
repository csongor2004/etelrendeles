import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User as FirebaseUser, signOut, setPersistence, browserSessionPersistence } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { User } from './interfaces';
import { Firestore, collection, query, where, getDocs, addDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUserProfile$: Observable<User | null> = this.currentUserSubject.asObservable();
  user$ = this.currentUserProfile$;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private http: HttpClient
  ) {
    // Beállítjuk, hogy az autentikáció ne maradjon meg a böngésző bezárása/frissítése után
    setPersistence(this.auth, browserSessionPersistence)
      .then(() => {
        this.auth.onAuthStateChanged(user => {
          if (user) {
            this.getUserProfile(user.email!).catch(() => {
              this.setUser(null);
            });
          } else {
            this.setUser(null);
            // Biztosítsuk, hogy minden egyéb helyi tárolást is töröljünk
            this.clearSessionStorage();
          }
        });
      })
      .catch(() => {
        // Kezelhetjük itt a perzisztencia beállításának hibáját, ha szükséges
      });
    
    // Eltávolítjuk a localStorage használatát a bejelentkezési adatok betöltésénél
    // this.loadSessionFromLocalStorage();
    
    // Eseményfigyelő hozzáadása a böngészőablak bezárására/frissítésére
    window.addEventListener('beforeunload', () => {
      this.clearSessionStorage();
      this.setUser(null);
    });
  }

  private loadUsersFromLocalStorage(): User[] {
    const usersString = localStorage.getItem('users');
    return usersString ? JSON.parse(usersString) : [];
  }

  private saveUsersToLocalStorage(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Módosítjuk, hogy sessionStorage-ot használjon localStorage helyett
  private saveSessionToSessionStorage(email: string | null): void {
    if (email) {
      sessionStorage.setItem('currentUserEmail', email);
    } else {
      sessionStorage.removeItem('currentUserEmail');
    }
  }

  // Töröljük az összes munkamenethez kapcsolódó adatot
  private clearSessionStorage(): void {
    sessionStorage.removeItem('currentUserEmail');
  }

  async register(email: string, password: string, name: string): Promise<void> {
    try {
      const users = this.loadUsersFromLocalStorage();
      if (users.some(user => user.email === email)) {
        throw new Error('Ez az email cím már használatban van.');
      }

      const firebaseUserCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      if (firebaseUserCredential?.user) {
        const newUser: User = {
          email: email,
          jelszo: password,
          nev: name,
          rendelesekSzama: 0,
          profilkep: '',
          uid: firebaseUserCredential.user.uid
        };
        users.push(newUser);
        this.saveUsersToLocalStorage(users);
        // Bejelentkeztetjük a regisztráció után sessionStorage-ba
        this.saveSessionToSessionStorage(email);
        await this.createUserProfileInFirestore(firebaseUserCredential.user, name, password);
        this.setUser(newUser);
        this.router.navigate(['/home']);
      } else {
        throw new Error('Sikertelen regisztráció.');
      }
    } catch (error: any) {
      throw error instanceof Error ? error : new Error('Ismeretlen hiba történt.');
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    const users = this.loadUsersFromLocalStorage();
    const user = users.find(u => u.email === email && u.jelszo === password);

    if (user) {
      // A sessionStorage-ba mentjük el a felhasználót localStorage helyett
      this.saveSessionToSessionStorage(email);
      this.setUser(user);
      this.router.navigate(['/home']);
      return true; // Sikeres bejelentkezés
    } else {
      this.setUser(null);
      return false; // Sikertelen bejelentkezés
    }
  }

  private async createUserProfileInFirestore(firebaseUser: FirebaseUser, name: string, password: string): Promise<void> {
    try {
      const usersRef = collection(this.firestore, 'users');
      await addDoc(usersRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        jelszo: password,
        name: name,
        rendelesek_szama: 0,
        photoURL: ''
      });
    } catch (error) {
      throw new Error('Hiba a felhasználói profil létrehozása során.');
    }
  }

  private async getUserProfile(email: string): Promise<void> {
    const users = this.loadUsersFromLocalStorage();
    const user = users.find(u => u.email === email);
    this.setUser(user || null);
    if (user) {
      this.router.navigate(['/home']);
    } else {
      this.setUser(null);
      throw new Error('Felhasználói profil nem található.');
    }
  }

  setUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  logout(): Promise<boolean> {
    this.setUser(null);
    this.clearSessionStorage(); // Töröljük a session adatokat kijelentkezéskor
    return signOut(this.auth).then(() => this.router.navigate(['/login']));
  }

  updateUserName(email: string, newName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const users = this.loadUsersFromLocalStorage();
      const userIndex = users.findIndex(u => u.email === email);
      if (userIndex > -1) {
        users[userIndex].nev = newName;
        this.saveUsersToLocalStorage(users);
        const currentUser = this.currentUserSubject.value;
        if (currentUser && currentUser.email === email) {
          this.setUser({ ...currentUser, nev: newName });
        }
        resolve();
      } else {
        reject(new Error('Felhasználó nem található.'));
      }
    });
  }
}