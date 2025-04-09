// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { KosarComponent } from './pages/kosar/kosar.component';
import { ModositasComponent } from './pages/modositas/modositas.component';
import { RegisterComponent } from './pages/register/register.component';
import { RendelesComponent } from './pages/rendeles/rendeles.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { RendeleslistazComponent } from './pages/rendeleslistaz/rendeleslistaz.component';
import { FomenuComponent } from './shared/fomenu/fomenu.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'rendeles', component: RendelesComponent },
  { path: 'kosar', component: KosarComponent },
  { path: 'profil', component: ProfilComponent },
  { path: 'modositas', component: ModositasComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'rendeleslistaz', component: RendeleslistazComponent },
  { path: '**', redirectTo: 'login' }
];