import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyValue',
  standalone: true
})
export class CurrencyValuePipe implements PipeTransform {
  transform(value: number | null | undefined, currency = 'EUR'): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(value);
  }
}
