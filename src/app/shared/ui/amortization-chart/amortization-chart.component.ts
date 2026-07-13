import { Component, Input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { AmortizationData } from '../simulation-chart/simulation-chart.component';

@Component({
  selector: 'app-amortization-chart',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lineData()) {
      <p-card styleClass="rounded-xl shadow-sm border-t-4 border-t-primary-500 h-187 w-full">
        <ng-template pTemplate="title">
          <span class="text-surface-900 font-semibold text-lg">Proyección de Amortización (Capital Pendiente)</span>
        </ng-template>
        <ng-template pTemplate="content">
          <p-chart type="line" [data]="lineData()" [options]="lineOptions" height="600px" />
        </ng-template>
      </p-card>
    }
  `
})
export class AmortizationChartComponent {
  @Input() set amortization(value: { base: AmortizationData, sim: AmortizationData | null } | null) {
    this._amortization.set(value);
  }

  private _amortization = signal<{ base: AmortizationData, sim: AmortizationData | null } | null>(null);

  lineData = computed(() => {
    const am = this._amortization();
    if (!am) return null;

    const baseData = this.calculateAmortizationSeries(am.base);
    const simData = am.sim ? this.calculateAmortizationSeries(am.sim) : { series: [], pointRadii: [], pointColors: [] };

    const maxMonths = Math.max(am.base.months, am.sim?.months ?? 0, 12);
    const labels = Array.from({ length: maxMonths + 1 }, (_, i) => `Mes ${i}`);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Base',
          borderColor: 'rgb(148, 163, 184)',
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: baseData.pointRadii,
          pointBackgroundColor: baseData.pointColors,
          pointBorderColor: baseData.pointColors,
          pointHoverRadius: 10,
          data: baseData.series
        },
        {
          label: 'Simulado',
          borderColor: 'rgb(14, 165, 233)',
          backgroundColor: 'rgba(14, 165, 233, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: simData.pointRadii,
          pointBackgroundColor: simData.pointColors,
          pointBorderColor: simData.pointColors,
          pointHoverRadius: 10,
          data: simData.series
        }
      ]
    };
  });

  private calculateAmortizationSeries(data: AmortizationData): { series: number[], pointRadii: number[], pointColors: string[], breakevenMonth: number | null } {
    let balance = data.principal;
    const series = [balance];
    const pointRadii = [0];
    const pointColors = ['rgba(0,0,0,0)'];
    
    let cumulativeInterest = 0;
    let breakevenMonth: number | null = null;

    const rate = data.rate > 0 ? (data.rate / 100 / 12) : 0;
    const minPayment = (balance * rate) + 0.01;
    const payment = Math.max(data.payment, minPayment);

    for (let i = 1; i <= data.months; i++) {
      const interestForMonth = balance * rate;
      cumulativeInterest += interestForMonth;

      balance = balance * (1 + rate) - payment;
      if (balance <= 0) {
        series.push(0);
        pointRadii.push(0);
        pointColors.push('rgba(0,0,0,0)');
        break;
      }
      series.push(balance);

      if (breakevenMonth === null && cumulativeInterest >= data.ecl && data.ecl > 0) {
        breakevenMonth = i;
        pointRadii.push(8);
        pointColors.push('rgb(34, 197, 94)'); // green-500
      } else {
        pointRadii.push(0);
        pointColors.push('rgba(0,0,0,0)');
      }
    }

    while (series.length <= data.months) {
      series.push(0);
      pointRadii.push(0);
      pointColors.push('rgba(0,0,0,0)');
    }

    return { series, pointRadii, pointColors, breakevenMonth };
  }

  lineOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#495057'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          afterLabel: (context: any) => {
            if (context.dataset.pointRadius && context.dataset.pointRadius[context.dataIndex] > 0) {
              return '✅ Punto de Equilibrio: El banco ha recuperado el riesgo (ECL)';
            }
            return null;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        ticks: {
          color: '#495057',
          maxTicksLimit: 12
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
