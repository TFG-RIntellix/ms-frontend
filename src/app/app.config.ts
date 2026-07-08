import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import {
  provideKeycloak,
  includeBearerTokenInterceptor,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG
} from 'keycloak-angular';

import { routes } from './app.routes';
import { RintellixPreset } from './core/theme/rintellix-preset';
import { keycloakConfig } from './core/auth/keycloak.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        {
          urlPattern: /^(http:\/\/localhost:8080)(\/.*)?$/i,
          httpMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        }
      ]
    },
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: RintellixPreset,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      },
      ripple: true
    }),
    provideKeycloak({
      config: keycloakConfig,
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : 'http://localhost:4200/silent-check-sso.html'
      }
    })
  ]
};
