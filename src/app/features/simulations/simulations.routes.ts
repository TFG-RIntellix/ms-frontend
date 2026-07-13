import { Routes } from '@angular/router';

export const SIMULATION_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./simulations.component').then(c => c.SimulationsComponent) },
  { path: ':id', loadComponent: () => import('./simulation-detail/simulation-detail.component').then(c => c.SimulationDetailComponent) }
];
