import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyValuePipe } from '../currency-value/currency-value.pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-metric-card',
  imports: [CommonModule, CurrencyValuePipe],
  template: `
    <div class="h-full bg-white rounded-xl p-5 border border-surface-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
      <div class="flex flex-col h-full justify-between">
        <label class="text-xs uppercase tracking-wider font-semibold text-surface-500 mb-2 group-hover:text-primary-600 transition-colors">
          {{ label() }}
        </label>
        <div class="text-3xl font-bold text-surface-900 tracking-tight">
          @if (isCurrency()) {
            <span class="text-primary-700">
              {{ value() | currencyValue:currency() }}
            </span>
          } @else {
            {{ value() | number:format() }}
          }
        </div>
      </div>
    </div>
  `
})
export class MetricCardComponent {
  label = input.required<string>();
  value = input.required<number>();
  isCurrency = input(false);
  currency = input('EUR');
  format = input<string>('1.0-4');
}
