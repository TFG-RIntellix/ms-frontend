import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';

export const authGuard: CanActivateFn = (_route, state) => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  if (!keycloak.authenticated) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (!keycloak.hasRealmRole('ANALISTA')) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};
