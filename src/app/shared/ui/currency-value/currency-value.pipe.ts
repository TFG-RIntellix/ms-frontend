import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'currencyValue',
})
export class CurrencyValuePipe implements PipeTransform {
  private formatters = new Map<string, Intl.NumberFormat>();
  transform(value: number | null | undefined, currency = 'EUR'): string {
    if (value === null || value === undefined) {
      return '-';
    }
    
    let formatter = this.formatters.get(currency);
    if (!formatter) {
      formatter = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      });
      this.formatters.set(currency, formatter);
    }
    
    return formatter.format(value);
  }
}
