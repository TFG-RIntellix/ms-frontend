import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { MessageService } from 'primeng/api';

export const authGuard: CanActivateFn = (_route, state) => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);
  const messageService = inject(MessageService);

  if (!keycloak.authenticated) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (!keycloak.hasRealmRole('ANALISTA')) {
    if (!sessionStorage.getItem('viewer_warned')) {
      messageService.add({
        severity: 'warn',
        summary: 'Modo de Solo Lectura',
        detail: 'No está autorizado a acceder a ciertas funciones de escritura. Solo dispone de vista.',
        life: 5000
      });
      sessionStorage.setItem('viewer_warned', 'true');
    }
  }

  return true;
};
