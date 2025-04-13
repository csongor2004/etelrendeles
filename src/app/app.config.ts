// src/app/app.config.ts

import { ApplicationConfig, importProvidersFrom, ErrorHandler } from '@angular/core';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient } from '@angular/common/http';

import { GlobalErrorHandlerService } from './services/global-error-handler.service';



// Firebase modulok importálása

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { getAuth, provideAuth } from '@angular/fire/auth';



// Firebase konfiguráció

const firebaseConfig = {

  apiKey: "AIzaSyDdgsB9vDGBuMRrRV7gDhkcdedADxG2koo",

  authDomain: "etel-rendeles-app.firebaseapp.com",

  projectId: "etel-rendeles-app",

  storageBucket: "etel-rendeles-app.appspot.com",

  messagingSenderId: "68885110969",

  appId: "1:68885110969:web:030c12dd8f747cfe473b68",

  measurementId: "G-QGYC9H03QT"

};



export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideAnimations(),

    provideHttpClient(),

    { provide: ErrorHandler, useClass: GlobalErrorHandlerService }, // Globális hibakezelő hozzáadva

    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    provideFirestore(() => getFirestore()),

    provideAuth(() => getAuth())

  ]

};