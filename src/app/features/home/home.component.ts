import { Component , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  buttonLabel: string;
  buttonSeverity: ButtonSeverity;
  route: string;
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, PageHeaderComponent, LottieComponent],
  template: `
    <app-page-header
      title="Inicio"
      subtitle="Bienvenido a RIntellix Dashboard"
    />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <!-- Solicitudes Card -->
      @for (card of menuCards; track card.title) {
      <p-card styleClass="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 h-full group">
        <ng-template pTemplate="content">
          <div class="flex flex-col items-center text-center space-y-4 py-4">
            <div [class]="'w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ' + card.iconBgClass">
              <ng-lottie [options]="{path: card.icon}" width="80px" height="80px" />
            </div>
            <h3 class="text-xl font-semibold text-surface-900 group-hover:text-primary-600 transition-colors duration-300">{{ card.title }}</h3>
            <p class="text-surface-500 flex-1">
              {{ card.description }}
            </p>
            <p-button
              [label]="card.buttonLabel"
              icon="pi pi-arrow-right"
              iconPos="right"
              styleClass="w-full"
              [severity]="card.buttonSeverity"
              [routerLink]="card.route"
            />
          </div>
        </ng-template>
      </p-card>
      }
    </div>
    `
})
export class HomeComponent {
  readonly menuCards: DashboardCard[] = [
    {
      title: 'Solicitudes',
      description: 'Gestiona, evalúa y resuelve las solicitudes de riesgo de los clientes con el motor inteligente.',
      icon: '/assets/icons/REQUESTS.json',
      iconBgClass: 'bg-primary-100',
      iconTextClass: 'text-primary-600',
      buttonLabel: 'Ver solicitudes',
      buttonSeverity: undefined, // Color primario por defecto
      route: '/requests'
    },
    {
      title: 'Simulaciones',
      description: 'Carga escenarios y simulaciones guardadas para comparar opciones de mitigación de riesgo.',
      icon: '/assets/icons/SIMULATIONS.json',
      iconBgClass: 'bg-blue-100',
      iconTextClass: 'text-blue-600',
      buttonLabel: 'Ver simulaciones',
      buttonSeverity: 'info',
      route: '/simulations'
    },
    {
      title: 'Informes',
      description: 'Descarga informes regulatorios y analíticos del estado actual de la cartera.',
      icon: '/assets/icons/REPORTS.json',
      iconBgClass: 'bg-green-100',
      iconTextClass: 'text-green-600',
      buttonLabel: 'Ver informes',
      buttonSeverity: 'success',
      route: '/reports'
    }
  ];
}
