import { Routes } from '@angular/router';

export const REQUEST_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./request-list/request-list.component').then(c => c.RequestListComponent) },
  { path: ':id', loadComponent: () => import('./request-detail/request-detail.component').then(c => c.RequestDetailComponent) },
  { path: ':id/scoring', loadComponent: () => import('../scoring/scoring.component').then(c => c.ScoringComponent) },
  { path: ':id/simulate', loadComponent: () => import('../simulate/simulate.component').then(c => c.SimulateComponent) }
];
