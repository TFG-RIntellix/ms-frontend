import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, PageHeaderComponent],
  template: `
    <app-page-header
      title="Inicio"
      subtitle="Bienvenido a RIntellix Dashboard"
    />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <!-- Solicitudes Card -->
      <p-card styleClass="rounded-xl shadow-sm hover:shadow-md transition h-full">
        <ng-template pTemplate="content">
          <div class="flex flex-col items-center text-center space-y-4 py-4">
            <div class="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <i class="pi pi-users text-3xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-surface-900">Solicitudes</h3>
            <p class="text-surface-500 flex-1">
              Gestiona, evalúa y resuelve las solicitudes de riesgo de los clientes con el motor inteligente.
            </p>
            <p-button
              label="Ver solicitudes"
              icon="pi pi-arrow-right"
              iconPos="right"
              styleClass="w-full"
              routerLink="/requests"
            />
          </div>
        </ng-template>
      </p-card>

      <!-- Simulaciones Card -->
      <p-card styleClass="rounded-xl shadow-sm hover:shadow-md transition h-full">
        <ng-template pTemplate="content">
          <div class="flex flex-col items-center text-center space-y-4 py-4">
            <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="pi pi-chart-line text-3xl text-blue-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-surface-900">Simulaciones</h3>
            <p class="text-surface-500 flex-1">
              Carga escenarios y simulaciones guardadas para comparar opciones de mitigación de riesgo.
            </p>
            <p-button
              label="Ver simulaciones"
              icon="pi pi-arrow-right"
              iconPos="right"
              styleClass="w-full"
              severity="info"
              routerLink="/simulations"
            />
          </div>
        </ng-template>
      </p-card>

      <!-- Informes Card -->
      <p-card styleClass="rounded-xl shadow-sm hover:shadow-md transition h-full">
        <ng-template pTemplate="content">
          <div class="flex flex-col items-center text-center space-y-4 py-4">
            <div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <i class="pi pi-file-pdf text-3xl text-green-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-surface-900">Informes</h3>
            <p class="text-surface-500 flex-1">
              Genera y descarga informes regulatorios y analíticos del estado actual de la cartera.
            </p>
            <p-button
              label="Ver informes"
              icon="pi pi-arrow-right"
              iconPos="right"
              styleClass="w-full"
              severity="success"
              routerLink="/reports"
            />
          </div>
        </ng-template>
      </p-card>
    </div>
  `
})
export class HomeComponent {}
