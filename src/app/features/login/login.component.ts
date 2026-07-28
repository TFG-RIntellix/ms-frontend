import { Component, inject , ChangeDetectionStrategy} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import Keycloak from 'keycloak-js';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  imports: [CardModule, ButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <p-card styleClass="w-full max-w-md shadow-lg rounded-2xl">
        <ng-template pTemplate="content">
          <div class="flex flex-col items-center text-center mb-6">
            <div class="h-16 w-16 rounded-2xl bg-primary-500 flex items-center justify-center mb-4 shadow-md">
              <i class="pi pi-chart-line text-white text-3xl"></i>
            </div>
            <h1 class="text-2xl font-semibold text-surface-900">RIntellix</h1>
            <p class="text-surface-500 mt-1">Gestión de riesgos de crédito</p>
          </div>
          <p-button
            styleClass="w-full"
            label="Iniciar sesión con Keycloak"
            icon="pi pi-sign-in"
            (onClick)="login()"
          />
        </ng-template>
      </p-card>
    </div>
  `
})
export class LoginComponent {
  private keycloak = inject(Keycloak);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  login() {
    const redirectUri = `${window.location.origin}${this.returnUrl}`;
    this.keycloak.login({ redirectUri });
  }
}
