import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyValuePipe } from '../currency-value/currency-value.pipe';

export type RiskSeverity = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-risk-metric-card',
  standalone: true,
  imports: [CommonModule, CurrencyValuePipe],
  template: `
    <div
      class="rounded-xl p-4 border-l-4 transition-all duration-200 hover:shadow-md"
      [style.background-color]="colors().bg"
      [style.border-left-color]="colors().border"
    >
      <div class="flex items-center gap-2 mb-1">
        <i class="pi text-sm" [class]="icon()" [style.color]="colors().border"></i>
        <span class="text-sm font-medium text-surface-600">{{ label() }}</span>
      </div>
      <div class="text-2xl font-bold" [style.color]="colors().text">
        @if (isCurrency()) {
          {{ value() | currencyValue }}
        } @else {
          {{ value() | number:format() }}{{ suffix() }}
        }
      </div>
      <div class="text-xs mt-1 font-medium" [style.color]="colors().border">
        {{ severityLabel() }}
      </div>
    </div>
  `
})
export class RiskMetricCardComponent {
  label = input.required<string>();
  value = input.required<number>();
  severity = input.required<RiskSeverity>();
  isCurrency = input(false);
  format = input<string>('1.2-2');
  suffix = input<string>('');
  icon = input<string>('pi-shield');

  colors = computed(() => {
    switch (this.severity()) {
      case 'low':
        return {
          bg: 'hsl(142, 52%, 92%)',
          border: 'hsl(142, 45%, 48%)',
          text: 'hsl(142, 45%, 30%)'
        };
      case 'medium':
        return {
          bg: 'hsl(45, 80%, 92%)',
          border: 'hsl(45, 70%, 48%)',
          text: 'hsl(45, 70%, 30%)'
        };
      case 'high':
        return {
          bg: 'hsl(0, 70%, 94%)',
          border: 'hsl(0, 60%, 55%)',
          text: 'hsl(0, 60%, 35%)'
        };
    }
  });

  severityLabel = computed(() => {
    switch (this.severity()) {
      case 'low': return 'Riesgo bajo';
      case 'medium': return 'Riesgo moderado';
      case 'high': return 'Riesgo elevado';
    }
  });
}
