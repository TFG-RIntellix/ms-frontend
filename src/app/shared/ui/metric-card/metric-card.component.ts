import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { CurrencyValuePipe } from '../currency-value/currency-value.pipe';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, CardModule, CurrencyValuePipe],
  template: `
    <p-card styleClass="shadow-sm h-full">
      <ng-template pTemplate="content">
        <label class="text-sm text-surface-500">{{ label() }}</label>
        <div class="text-xl font-semibold text-surface-900 mt-1">
          @if (isCurrency()) {
            {{ value() | currencyValue:currency() }}
          } @else {
            {{ value() | number:format() }}
          }
        </div>
      </ng-template>
    </p-card>
  `
})
export class MetricCardComponent {
  label = input.required<string>();
  value = input.required<number>();
  isCurrency = input(false);
  currency = input('EUR');
  format = input<string>('1.0-4');
}
