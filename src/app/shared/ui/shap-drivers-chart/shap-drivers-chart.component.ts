import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TopFeature } from '../../../core/models/scoring.model';

@Component({
  selector: 'app-shap-drivers-chart',
  imports: [CommonModule, ChartModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="rounded-xl shadow-sm border border-surface-200 bg-white transition-all duration-300 hover:shadow-md">
      <ng-template pTemplate="title">
        <div class="flex items-center gap-3 border-b border-surface-200 pb-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-100 text-surface-600 shadow-sm">
            <i class="pi pi-chart-bar"></i>
          </div>
          <span class="text-surface-900 font-bold text-lg tracking-tight">Drivers Principales (SHAP)</span>
        </div>
      </ng-template>
      <ng-template pTemplate="content">
        <!-- SHAP horizontal bar chart -->
        <div class="mb-8 mt-2 p-4 bg-surface-50/50 rounded-xl border border-surface-100">
          <p-chart type="bar" [data]="chartData()" [options]="chartOptions" [height]="chartHeight()" />
        </div>
        <!-- Summary table -->
        <div class="overflow-hidden rounded-xl border border-surface-200 shadow-sm">
          <table class="w-full text-sm">
            <thead class="bg-surface-50">
              <tr class="border-b border-surface-200">
                <th class="text-left py-3 px-4 text-surface-600 font-semibold uppercase tracking-wider text-xs">Variable</th>
                <th class="text-left py-3 px-4 text-surface-600 font-semibold uppercase tracking-wider text-xs">Valor</th>
                <th class="text-right py-3 px-4 text-surface-600 font-semibold uppercase tracking-wider text-xs">SHAP</th>
                <th class="text-center py-3 px-4 text-surface-600 font-semibold uppercase tracking-wider text-xs">Impacto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100 bg-white">
              @for (feature of sortedFeatures(); track feature.featureName) {
                <tr class="hover:bg-surface-50 transition-colors duration-200 group">
                  <td class="py-3 px-4 font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">{{ feature.featureName }}</td>
                  <td class="py-3 px-4 text-surface-600 font-medium">{{ formatValue(feature.featureValue) }}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold"
                      [class]="feature.shapValue > 0 ? 'text-red-500' : 'text-emerald-500'">
                    {{ feature.shapValue > 0 ? '+' : '' }}{{ feature.shapValue | number:'1.2-3' }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5"
                      [class]="feature.shapValue > 0
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                    >
                      <i class="pi text-[10px]" [class]="feature.shapValue > 0 ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
                      {{ feature.shapValue > 0 ? 'Aumenta riesgo' : 'Reduce riesgo' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </ng-template>
    </p-card>
  `
})
/**
 * Reusable UI Component that renders a horizontal bar chart displaying SHAP values.
 * Visualizes the top positive and negative drivers contributing to a machine learning model's prediction.
 */
export class ShapDriversChartComponent {
  features = input<TopFeature[]>([]);
  baseValue = input<number>(0);

  sortedFeatures = computed(() => {
    return [...this.features()].sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));
  });

  formatValue(val: string | number): string {
    const num = Number(val);
    if (!isNaN(num) && val !== null && val !== '' && typeof val !== 'boolean') {
      return num.toLocaleString('es-ES', { maximumFractionDigits: 3 });
    }
    return String(val);
  }

  chartHeight = computed(() => {
    const count = this.features().length;
    return Math.max(count * 52, 200) + 'px';
  });

  chartData = computed(() => {
    const features = this.sortedFeatures();
    const reversed = [...features].reverse();
    const labels = reversed.map(f => f.featureName);
    const values = reversed.map(f => f.shapValue);
    
    // Balanced pastel colors
    const bgColors = reversed.map(f =>
      f.shapValue > 0 
        ? 'rgba(239, 68, 68, 0.8)'  // Tailwind Red 500
        : 'rgba(34, 197, 94, 0.8)'   // Tailwind Green 500
    );
    const borderColors = reversed.map(f =>
      f.shapValue > 0 
        ? 'rgb(220, 38, 38)' // Red 600
        : 'rgb(22, 163, 74)' // Green 600
    );

    return {
      labels,
      datasets: [
        {
          label: 'Contribución SHAP',
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          hoverBackgroundColor: reversed.map(f =>
            f.shapValue > 0 ? 'rgba(248, 113, 113, 1)' : 'rgba(52, 211, 153, 1)'
          )
        }
      ]
    };
  });

  chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { left: 5, right: 15 }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            const sign = value > 0 ? '+' : '';
            const direction = value > 0 ? '↑ Aumenta riesgo' : '↓ Reduce riesgo';
            const formattedValue = value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
            return `SHAP: ${sign}${formattedValue} — ${direction}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: (context: any) => {
            if (context.tick && context.tick.value === 0) {
              return '#94a3b8'; // Prominent zero line
            }
            return '#f1f5f9';
          },
          lineWidth: (context: any) => {
            if (context.tick && context.tick.value === 0) {
              return 2;
            }
            return 1;
          }
        },
        ticks: {
          color: '#64748b',
          font: { size: 12, weight: '500' },
          callback: (value: number) => {
            const formatted = value.toLocaleString('es-ES', { maximumFractionDigits: 3 });
            return value > 0 ? `+${formatted}` : `${formatted}`;
          }
        },
        title: {
          display: true,
          text: '← Reduce riesgo          Aumenta riesgo →',
          color: '#64748b',
          font: { size: 12, style: 'italic' as const, weight: '500' },
          padding: { top: 10 }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: '#334155',
          font: { size: 12, weight: '600' },
          crossAlign: 'far' as const
        }
      }
    }
  };
}
