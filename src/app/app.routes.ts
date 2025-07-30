import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NovaRotaComponent } from './pages/nova-rota/nova-rota.component';
import { MinhasRotasComponent } from './pages/minhas-rotas/minhas-rotas.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'nova-rota', component: NovaRotaComponent },
  { path: 'minhas-rotas', component: MinhasRotasComponent },
  { path: 'home', component: HomeComponent },
  { path: '**', redirectTo: '/login' }
];