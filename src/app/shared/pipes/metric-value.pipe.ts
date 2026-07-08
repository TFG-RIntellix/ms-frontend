import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CurrencyValuePipe } from '../ui/currency-value/currency-value.pipe';

export interface MetricFormat {
  isCurrency: boolean;
  format?: string;
}

@Pipe({
  name: 'metricValue',
  standalone: true
})
export class MetricValuePipe implements PipeTransform {
  private currencyPipe = new CurrencyValuePipe();
  private decimalPipe = new DecimalPipe('en-US');

  transform(value: number | null | undefined, metric: MetricFormat): string {
    if (value === null || value === undefined) return '-';
    if (metric.isCurrency) {
      return this.currencyPipe.transform(value);
    }
    return this.decimalPipe.transform(value, metric.format ?? '1.0-2') ?? String(value);
  }
}
