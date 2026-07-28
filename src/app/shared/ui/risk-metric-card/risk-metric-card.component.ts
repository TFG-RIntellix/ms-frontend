import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyValuePipe } from '../currency-value/currency-value.pipe';

export type RiskSeverity = 'low' | 'medium' | 'high';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-risk-metric-card',
  imports: [CommonModule, CurrencyValuePipe],
  template: `
    <div
      class="relative overflow-hidden rounded-xl p-5 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-white"
      [style.border-color]="colors().border"
      [style.border-left-width]="'4px'"
      [style.border-left-color]="colors().accent"
    >
      <!-- Background icon watermark -->
      <div class="absolute -right-3 -bottom-4 opacity-10 transform rotate-12 transition-transform duration-300 group-hover:rotate-0">
        <i class="pi text-7xl" [class]="icon()" [style.color]="colors().text"></i>
      </div>

      <div class="relative z-10 flex items-center gap-2 mb-2">
        <div class="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm" [style.background-color]="colors().bgGradient" [style.color]="colors().text">
          <i class="pi text-sm" [class]="icon()"></i>
        </div>
        <span class="text-sm font-semibold uppercase tracking-wider text-surface-600">{{ label() }}</span>
      </div>
      <div class="relative z-10 text-3xl font-bold tracking-tight text-surface-900">
        @if (isCurrency()) {
          {{ value() | currencyValue }}
        } @else {
          {{ value() | number:format() }}{{ suffix() }}
        }
      </div>
      <div class="relative z-10 text-xs mt-2 font-medium inline-block px-2 py-1 rounded border" 
           [style.color]="colors().text" 
           [style.background-color]="colors().bgGradient"
           [style.border-color]="colors().border">
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
          bgGradient: '#f0fdf4', // Tailwind green-50
          border: '#bbf7d0',     // Tailwind green-200
          accent: '#22c55e',     // Tailwind green-500
          text: '#166534'
        };
      case 'medium':
        return {
          bgGradient: '#fefce8', // Tailwind yellow-50
          border: '#fef08a',     // Tailwind yellow-200
          accent: '#eab308',     // Tailwind yellow-500
          text: '#854d0e'
        };
      case 'high':
        return {
          bgGradient: '#fef2f2', // Tailwind red-50
          border: '#fecaca',     // Tailwind red-200
          accent: '#ef4444',     // Tailwind red-500
          text: '#991b1b'
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
