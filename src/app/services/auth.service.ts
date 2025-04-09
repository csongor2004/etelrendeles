import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, User as FirebaseUser, signOut } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../services/interfaces';
import { Firestore, collection, query, where, getDocs, doc, updateDoc, addDoc } from '@angular/fire/firestore'; // Itt adtam hozzá az addDoc-ot
import { Router } from '@angular/router'; // Importáljuk a Router-t

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUserProfile$: Observable<User | null> = this.currentUserSubject.asObservable();

  // For compatibility with previous code
  user$ = this.currentUserProfile$;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router // Injektáljuk a Router-t
  ) {
    // Check if user is already logged in or if there's a redirect result
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.getUserProfile(user.email!);
      } else {
        this.setUser(null);
      }
    });

    getRedirectResult(this.auth)
      .then(result => {
        if (result?.user) {
          const user = result.user;
          this.checkAndCreateUser(user);
        }
      })
      .catch(error => {
        console.error('Google Sign-In failed with redirect:', error);
        // Kezeld a hibákat itt
      });
  }

  loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    return signInWithRedirect(this.auth, provider);
  }

  private checkAndCreateUser(firebaseUser: FirebaseUser): void {
    if (!firebaseUser.email) return;

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where("email", "==", firebaseUser.email));

    getDocs(q).then(snapshot => {
      if (snapshot.empty) {
        // Új felhasználó létrehozása
        const userRef = collection(this.firestore, 'users');
        const newUser = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Új felhasználó',
          photoURL: firebaseUser.photoURL || '',
          rendelesek_szama: 0,
          uid: firebaseUser.uid
        };

        from(addDoc(userRef, newUser)).subscribe(() => {
          this.getUserProfile(firebaseUser.email!);
        });
      } else {
        this.getUserProfile(firebaseUser.email!);
      }
    });
  }

  private getUserProfile(email: string): void {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where("email", "==", email));

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        const user: User = {
          email: data['email'] || '',
          nev: data['name'] || '',
          rendelesekSzama: data['rendelesek_szama'] || 0,
          profilkep: data['photoURL'] || ''
        };
        this.setUser(user);
        this.router.navigateByUrl('/home'); // Navigáció a profil betöltése után
      }
    });
  }


  setUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  logout(): Promise<void> {
    this.setUser(null);
    return signOut(this.auth);
  }

  updateUserName(email: string, newName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where("email", "==", email));

      getDocs(q).then(snapshot => {
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          const userRef = doc(this.firestore, 'users', userDoc.id);

          updateDoc(userRef, { name: newName }).then(() => {
            // Frissítjük a felhasználót a memóriában
            const currentUser = this.currentUserSubject.value;
            if (currentUser && currentUser.email === email) {
              this.setUser({
                ...currentUser,
                nev: newName
              });
            }
            resolve();
          }).catch(err => reject(err));
        } else {
          reject(new Error('Felhasználó nem található'));
        }
      }).catch(err => reject(err));
    });
  }
}