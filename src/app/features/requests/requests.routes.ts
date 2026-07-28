import { Routes } from '@angular/router';

export const REQUEST_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./request-list/request-list.component').then(c => c.RequestListComponent) },
  { path: ':id', loadComponent: () => import('./request-detail/request-detail.component').then(c => c.RequestDetailComponent), data: { breadcrumb: 'Detalle' } },
  { path: ':id/scoring', loadComponent: () => import('../scoring/scoring.component').then(c => c.ScoringComponent), data: { breadcrumb: 'Scoring' } },
  { path: ':id/simulate', loadComponent: () => import('../simulate/simulate.component').then(c => c.SimulateComponent), data: { breadcrumb: 'Simular' } }
];
