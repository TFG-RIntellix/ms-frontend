import { Routes } from '@angular/router';

import { requestResolver } from './request.resolver';
import { ActivatedRouteSnapshot } from '@angular/router';

export const REQUEST_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./request-list/request-list.component').then(c => c.RequestListComponent) },
  {
    path: ':id',
    resolve: { requestInfo: requestResolver },
    data: { breadcrumb: (route: ActivatedRouteSnapshot) => route.data['requestInfo']?.code ? `Solicitud ${route.data['requestInfo'].code}` : 'Detalle' },
    children: [
      { path: '', loadComponent: () => import('./request-detail/request-detail.component').then(c => c.RequestDetailComponent) },
      { path: 'scoring', loadComponent: () => import('../scoring/scoring.component').then(c => c.ScoringComponent), data: { breadcrumb: 'Scoring' } },
      { path: 'simulate', loadComponent: () => import('../simulate/simulate.component').then(c => c.SimulateComponent), data: { breadcrumb: 'Simular' } }
    ]
  }
];
