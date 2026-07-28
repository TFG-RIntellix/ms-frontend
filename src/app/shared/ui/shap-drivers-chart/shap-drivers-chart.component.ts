import { Component, Input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TopFeature } from '../../../core/models/scoring.model';

@Component({
  selector: 'app-shap-drivers-chart',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="rounded-xl shadow-sm">
      <ng-template pTemplate="title">
        <span class="text-surface-900 font-semibold">Principales drivers</span>
      </ng-template>
      <ng-template pTemplate="content">
        <!-- SHAP horizontal bar chart -->
        <div class="mb-6">
          <p-chart type="bar" [data]="chartData()" [options]="chartOptions" [height]="chartHeight()" />
        </div>

        <!-- Summary table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200">
                <th class="text-left py-2 px-3 text-surface-500 font-medium">Variable</th>
                <th class="text-left py-2 px-3 text-surface-500 font-medium">Valor</th>
                <th class="text-right py-2 px-3 text-surface-500 font-medium">SHAP</th>
                <th class="text-center py-2 px-3 text-surface-500 font-medium">Impacto</th>
              </tr>
            </thead>
            <tbody>
              @for (feature of sortedFeatures(); track feature.featureName) {
                <tr class="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td class="py-2.5 px-3 font-medium text-surface-900">{{ feature.featureName }}</td>
                  <td class="py-2.5 px-3 text-surface-600">{{ feature.featureValue }}</td>
                  <td class="py-2.5 px-3 text-right font-mono text-sm"
                      [class]="feature.shapValue > 0 ? 'text-red-600' : 'text-emerald-600'">
                    {{ feature.shapValue > 0 ? '+' : '' }}{{ feature.shapValue | number:'1.4-4' }}
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      [class]="feature.shapValue > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'"
                    >
                      <i class="pi text-xs" [class]="feature.shapValue > 0 ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
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
export class ShapDriversChartComponent {
  @Input() set features(value: TopFeature[]) {
    this._features.set(value || []);
  }
  @Input() set baseValue(value: number) {
    this._baseValue.set(value || 0);
  }

  private _features = signal<TopFeature[]>([]);
  private _baseValue = signal<number>(0);

  sortedFeatures = computed(() => {
    return [...this._features()].sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));
  });

  chartHeight = computed(() => {
    const count = this._features().length;
    return Math.max(count * 52, 200) + 'px';
  });

  chartData = computed(() => {
    const features = this.sortedFeatures();
    // Reverse so highest impact is at top (Chart.js renders bottom-to-top for horizontal)
    const reversed = [...features].reverse();

    const labels = reversed.map(f => `${f.featureName} = ${f.featureValue}`);
    const values = reversed.map(f => f.shapValue);
    const bgColors = reversed.map(f =>
      f.shapValue > 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)'
    );
    const borderColors = reversed.map(f =>
      f.shapValue > 0 ? 'rgb(239, 68, 68)' : 'rgb(16, 185, 129)'
    );

    return {
      labels,
      datasets: [
        {
          label: 'Contribución SHAP',
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7,
          categoryPercentage: 0.85
        }
      ]
    };
  });

  chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            const sign = value > 0 ? '+' : '';
            const direction = value > 0 ? '↑ Aumenta riesgo' : '↓ Reduce riesgo';
            return `SHAP: ${sign}${value.toFixed(4)} — ${direction}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: (context: any) => {
            if (context.tick && context.tick.value === 0) {
              return '#64748b';
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
          font: { size: 11 },
          callback: (value: number) => {
            return value > 0 ? `+${value}` : `${value}`;
          }
        },
        title: {
          display: true,
          text: '← Reduce riesgo          Aumenta riesgo →',
          color: '#94a3b8',
          font: { size: 11, style: 'italic' as const }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: '#334155',
          font: { size: 12 },
          crossAlign: 'far' as const
        }
      }
    }
  };
}
