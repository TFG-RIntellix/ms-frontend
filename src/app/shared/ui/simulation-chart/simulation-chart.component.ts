import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
export interface ChartMetricRow {
  label: string;
  base: number;
  sim: number;
  delta: number;
  isCurrency: boolean;
  invert: boolean;
  hidden?: boolean;
}
export interface AmortizationData {
  principal: number;
  rate: number;
  months: number;
  payment: number;
  ecl: number;
}
@Component({
  selector: 'app-simulation-chart',
  imports: [CommonModule, ChartModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <p-card styleClass="rounded-xl shadow-sm h-full border-t-4 border-t-primary-500">
        <ng-template pTemplate="title">
          <span class="text-surface-900 font-semibold text-lg">Perfil de Riesgo (Relativo)</span>
        </ng-template>
        <ng-template pTemplate="content">
          <p-chart type="radar" [data]="radarData()" [options]="radarOptions" height="300px" />
        </ng-template>
      </p-card>
      <p-card styleClass="rounded-xl shadow-sm h-full border-t-4 border-t-primary-500">
        <ng-template pTemplate="title">
          <span class="text-surface-900 font-semibold text-lg">Magnitudes (Absolutas)</span>
        </ng-template>
        <ng-template pTemplate="content">
          <p-chart type="bar" [data]="barData()" [options]="barOptions" height="300px" />
        </ng-template>
      </p-card>
    </div>
  `
})
export class SimulationChartComponent {
  metrics = input<ChartMetricRow[]>([]);
  radarData = computed(() => {
    const data = this.metrics().filter(m => !m.hidden && !m.isCurrency);
    return {
      labels: data.map(m => m.label),
      datasets: [
        {
          label: 'Base',
          backgroundColor: 'rgba(148, 163, 184, 0.2)', // surface-400
          borderColor: 'rgb(148, 163, 184)',
          pointBackgroundColor: 'rgb(148, 163, 184)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(148, 163, 184)',
          data: data.map(m => m.base)
        },
        {
          label: 'Simulado',
          backgroundColor: 'rgba(14, 165, 233, 0.2)', // primary-500
          borderColor: 'rgb(14, 165, 233)',
          pointBackgroundColor: 'rgb(14, 165, 233)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(14, 165, 233)',
          data: data.map(m => m.sim)
        }
      ]
    };
  });
  barData = computed(() => {
    const data = this.metrics().filter(m => !m.hidden && m.isCurrency);
    return {
      labels: data.map(m => m.label),
      datasets: [
        {
          label: 'Base',
          backgroundColor: 'rgb(148, 163, 184)',
          data: data.map(m => m.base)
        },
        {
          label: 'Simulado',
          backgroundColor: 'rgb(14, 165, 233)',
          data: data.map(m => m.sim)
        }
      ]
    };
  });
  radarOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#495057'
        }
      }
    },
    scales: {
      r: {
        pointLabels: {
          color: '#495057',
        },
        grid: {
          color: '#ebedef',
        },
        angleLines: {
          color: '#ebedef'
        }
      }
    }
  };
  barOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#495057'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#495057'
        },
        grid: {
          color: '#ebedef',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: '#495057'
        },
        grid: {
          color: '#ebedef',
          drawBorder: false
        }
      }
    }
  };
}
