// src/app/services/interfaces.ts
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
    password?:string;
    nev: string;
    rendelesekSzama: number;
    profilkep: string;
    uid?: string;
}


export interface Rendeles {
    email: string; // A rendelés email címe
    osszeg: number; // A rendelés teljes összege
    datum: Date; // A rendelés dátuma/időpontja
}
