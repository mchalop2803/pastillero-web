import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';

import { Medications } from './pages/medications/medications';
import { Citas } from './pages/citas/citas';
import { Alerts } from './pages/alerts/alerts';

import { Register } from './pages/register/register';

import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },

      { path: 'medications', component: Medications },
      { path: 'citas', component: Citas },
      { path: 'alerts', component: Alerts },

      { path: '', redirectTo: 'medications', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];