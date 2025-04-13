// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { KosarComponent } from './pages/kosar/kosar.component';
import { ModositasComponent } from './pages/modositas/modositas.component';
import { RegisterComponent } from './pages/register/register.component';
import { RendelesComponent } from './pages/rendeles/rendeles.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { AuthGuard } from './guards/auth.guard';
import { RendeleslistazComponent } from './pages/rendeleslistaz/rendeleslistaz.component'; // Importáld a RendeleslistazComponent-et

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'rendeles', component: RendelesComponent, canActivate: [AuthGuard] },
  { path: 'kosar', component: KosarComponent, canActivate: [AuthGuard] },
  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
  { path: 'modositas', component: ModositasComponent, canActivate: [AuthGuard] },
  { path: 'rendeleslistaz', component: RendeleslistazComponent, canActivate: [AuthGuard] }, // Add this line
  { path: '**', redirectTo: 'login' }
];