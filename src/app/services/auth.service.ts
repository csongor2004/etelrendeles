import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, setDoc, query, where, getDocs } from '@angular/fire/firestore';
import { User } from './interfaces';
import { UserService } from './user.service'; // Import UserService

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  currentUserProfile$ = this.userSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private userService: UserService // Injektáljuk a UserService-t
  ) {
    // Felhasználó ellenőrzése indulásnál a localStorage-b\u00f3l (csak cache)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Rögtön kibocsátjuk a cachelt felhasználót, hogy gyorsabban megjelenjen a UI
      this.userSubject.next(JSON.parse(storedUser));
    }

    // Figyeljük a Firebase Auth állapot változását
    // Ez a megbízható módja a bejelentkezett felhasználó kezelésének
    this.auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Ha a Firebase Auth szerint be van jelentkezve, próbáljuk lekérni a profilját Firestore-b\u00f3l
        const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const user: User = {
            email: userData['email'] || '',
            nev: userData['name'] || '',
            rendelesekSzama: userData['rendelesek_szama'] || 0,
            profilkep: userData['photoURL'] || '',
            uid: firebaseUser.uid
          };
          this.setUser(user); // Beállítjuk a felhasználót (frissíti a localStorage-t is)
        } else {
          // Ha Auth szerint be van jelentkezve, de nincs Firestore profil, kijelentkeztetjük
          console.warn('Firebase Auth user found, but no Firestore profile. Logging out.');
          this.logout();
        }
      } else {
        // Ha nincs Firebase Auth user, töröljük a localStorage cache-t és beállítjuk null-ra
        this.setUser(null);
      }
    });
  }

  // ÚJ METÓDUS: Felhasználó lekérése UID alapján a UserService segítségével
  getUserById(uid: string): Observable<User | null> {
    return this.userService.getUserById(uid);
  }


  async register(email: string, password: string, name: string): Promise<{ success: boolean, message: string }> {
    try {
      // Ellenőrzés a Firestore-ban
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return {
          success: false,
          message: 'Ez az email cím már regisztrálva van az adatbázisban!'
        };
      }

      // Firebase Authentication regisztráció
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;

      // User dokumentum létrehozása Firestore-ban az UID-vel mint dokumentum ID
      const userProfileData = {
        email: email,
        name: name,
        photoURL: '',
        rendelesek_szama: 0
      };
      await setDoc(doc(this.firestore, 'users', firebaseUser.uid), userProfileData);

      // Regisztráció sikeres
      console.log('Regisztráció sikeres:', firebaseUser.email);
      // Az onAuthStateChanged listener fogja beállítani a felhasználót a setUser-rel
      return {
        success: true,
        message: 'Sikeres regisztráció!'
      };

    } catch (error: any) {
      console.error('Regisztráció hiba:', error);
      if (error.code === 'auth/email-already-in-use') {
        return {
          success: false,
          message: 'Ez az email cím már használatban van a Firebase Authentication-ben.'
        };
      }
      return {
        success: false,
        message: error.message || 'Hiba történt a regisztráció során.'
      };
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      // Firebase Authentication bejelentkezés
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;

      // Felhasználói profil dokumentum lekérése Firestore-b\u00f3l az UID alapján
      const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error('Felhasználó profil nem található a Firestore-ban az UID alapján.');
        await signOut(this.auth);
        return false;
      }

      // Felhasználói adatok mappingje és beállítása
      const userData = userDocSnap.data();
      const user: User = {
        email: userData['email'] || '',
        nev: userData['name'] || '',
        rendelesekSzama: userData['rendelesek_szama'] || 0,
        profilkep: userData['photoURL'] || '',
        uid: userDocSnap.id
      };

      // Felhasználó beállítása (frissíti a BehaviorSubject-et és a localStorage-t)
      this.setUser(user);
      console.log('Bejelentkezés sikeres:', user.email);
      return true;
    } catch (error: any) {
      console.error('Bejelentkezési hiba:', error);
      return false;
    }
  }

  // Felhasználó beállítása (BehaviorSubject és localStorage)
  setUser(user: User | null): void {
    this.userSubject.next(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  // Ezek a metódusok a localStorage-t kezelik, de a Firebase Auth és Firestore a megbízható forrás
  // Érdemes megfontolni, hogy ezekre valóban szükség van-e.
  getStoredUsers(): User[] {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  }

  setStoredUsers(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }
}
