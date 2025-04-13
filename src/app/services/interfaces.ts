// src/app/services/interfaces.ts
//'../../services/interfaces'
//EZEKEN SOHA NE VALTOZTASS
// src/app/services/interfaces.ts

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
  jelszo:string;
    nev: string;
  
    rendelesekSzama: number;
  
    profilkep: string;
  uid: string;
  }
  
  
  
  export interface Rendeles {
  
    email: string;
  
    osszeg: number;
  
    datum: Date;
  
  }