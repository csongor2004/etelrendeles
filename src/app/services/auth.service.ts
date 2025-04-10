import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User as FirebaseUser, signOut, setPersistence, browserSessionPersistence } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../services/interfaces';
import { Firestore, collection, query, where, getDocs, addDoc, doc, updateDoc } from '@angular/fire/firestore'; // Hozzáadtam a doc és updateDoc importokat
import { Router } from '@angular/router';

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
    private router: Router
  ) {
    setPersistence(this.auth, browserSessionPersistence)
      .then(() => {
        this.auth.onAuthStateChanged(user => {
          console.log("Auth state changed:", user?.email || "logged out");
          if (user) {
            this.getUserProfile(user.email!);
          } else {
            this.setUser(null);
          }
        });
      })
      .catch((error) => {
        // Itt meghagyhatod a console.error-t, mert ez egy kezdeti beállítási hiba
        console.error("Error setting persistence:", error);
      });
  }

  async register(email: string, password: string, name: string): Promise<void> {
    console.log("Starting registration process for:", email);
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      if (userCredential.user) {
        console.log("Successfully created user in Firebase Auth:", userCredential.user.uid);
        await this.createUserProfile(userCredential.user, name, password);
        await this.getUserProfile(email);
      }
    } catch (error: any) {
      // Itt kezeljük a várható Firebase regisztrációs hibákat
      if (error.code === 'auth/email-already-in-use') {
        // Ezt a hibát a komponensben kellene megjeleníteni a felhasználónak
        console.log("Email cím már használatban.");
      } else {
        // Csak a váratlan hibákat logoljuk
        console.error("Hiba a regisztráció során:", error);
      }
      throw error; // Fontos, hogy a hiba tovább legyen dobva, ha a komponensben fel kell dolgozni
    }
  }

  private async createUserProfile(firebaseUser: FirebaseUser, name: string, password: string): Promise<void> {
    console.log("Creating user profile in Firestore for:", firebaseUser.uid);
    try {
      const usersRef = collection(this.firestore, 'users');
      await addDoc(usersRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        jelszo: password,
        name: name,
        rendelesek_szama: 0,
        photoURL: '' // Alapértelmezett profilkép, ha szükséges
      });
      console.log("User profile created in Firestore.");
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    console.log("Starting login process for:", email);
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      if (userCredential.user) {
        console.log("Successfully logged in:", userCredential.user.email);
        await this.getUserProfile(email);
      }
    } catch (error: any) {
      // Itt kezeljük a várható Firebase bejelentkezési hibákat
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        // Ezt a hibát a komponensben kellene megjeleníteni a felhasználónak
        console.log("Hibás e-mail cím vagy jelszó.");
      } else {
        // Csak a váratlan hibákat logoljuk
        console.error("Hiba a bejelentkezés során:", error);
      }
      throw error; // Fontos, hogy a hiba tovább legyen dobva, ha a komponensben fel kell dolgozni
    }
  }

  private async getUserProfile(email: string): Promise<void> {
    console.log("Getting user profile for:", email);
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        const user: User = {
          email: data['email'] || '',
          jelszo: data['jelszo'] || '',
          nev: data['name'] || '',
          rendelesekSzama: data['rendelesek_szama'] || 0,
          profilkep: data['photoURL'] || ''
        };
        console.log("User profile loaded:", user);
        this.setUser(user);
        this.router.navigate(['/home']); // Sikeres bejelentkezés után a főoldalra irányít
      } else {
        console.log('User profile not found for email:', email);
        this.setUser(null);
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      this.setUser(null);
    }
  }

  setUser(user: User | null): void {
    console.log("Setting current user:", user?.email || "null");
    this.currentUserSubject.next(user);
  }

  logout(): Promise<void> {
    console.log("Logging out");
    this.setUser(null);
    return signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }

  updateUserName(email: string, newName: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const usersRef = collection(this.firestore, 'users');
        const q = query(usersRef, where("email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          const userRef = doc(this.firestore, 'users', userDoc.id); // Itt használod a doc-ot

          await updateDoc(userRef, { name: newName }); // Itt használod az updateDoc-ot

          const currentUser = this.currentUserSubject.value;
          if (currentUser && currentUser.email === email) {
            this.setUser({
              ...currentUser,
              nev: newName
            });
          }
          resolve();
        } else {
          reject(new Error('Felhasználó nem található'));
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}