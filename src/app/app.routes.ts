import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'requests', pathMatch: 'full' },
      { path: 'requests', loadChildren: () => import('./features/requests/requests.routes').then(m => m.REQUEST_ROUTES) },
      { path: 'simulations', loadComponent: () => import('./features/simulations/simulations.component').then(c => c.SimulationsComponent) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(c => c.ReportsComponent) }
    ]
  },
  { path: '**', redirectTo: 'requests' }
];
