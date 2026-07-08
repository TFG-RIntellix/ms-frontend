import { KeycloakConfig } from 'keycloak-js';
import { environment } from '../config/environment';

export const keycloakConfig: KeycloakConfig = {
  url: environment.keycloak.url,
  realm: environment.keycloak.realm,
  clientId: environment.keycloak.clientId
};
