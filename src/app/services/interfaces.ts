// src/app/services/interfaces.ts
//'../../services/interfaces'
//EZEKEN SOHA NE VALTOZTASS
export interface KosarTetel {
  id: number; 
  nev: string;
  ar: number;
  mennyiseg: number;
}

export interface Etel {
  id: number;  
  nev: string;
  ar: number;
  kep: string;
}

export interface User {
  email: string;
  nev: string;
  rendelesekSzama: number;
  profilkep: string;
}

export interface Rendeles {
  email: string;
  osszeg: number;
  datum: Date;
}