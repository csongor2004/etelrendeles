// src/app/services/rendeles.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

export interface Rendeles {
  rendelo: string;
  ar: number;
  datum: string;
  tetelek: {
    id: string;
    nev: string;
    ar: number;
    mennyiseg: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class RendelesService {
  private collectionNev = 'rendelesek';

  constructor(private firestore: Firestore) {}

  async ujRendelesHozzaadas(rendeles: Rendeles): Promise<void> {
    const kollekcioRef = collection(this.firestore, this.collectionNev);
    await addDoc(kollekcioRef, rendeles);
  }
}