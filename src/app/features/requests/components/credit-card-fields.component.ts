import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { RequestDetails } from '../../../core/models/request.model';
import { CurrencyValuePipe } from '../../../shared/ui/currency-value/currency-value.pipe';

@Component({
  selector: 'app-credit-card-fields',
  standalone: true,
  imports: [CommonModule, CardModule, CurrencyValuePipe],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <p-card styleClass="shadow-sm h-full">
        <ng-template pTemplate="content">
          <label class="text-sm text-surface-500">Límite de crédito solicitado</label>
          <div class="text-xl font-semibold text-surface-900 mt-1">
            {{ request().requestedCreditLimit | currencyValue:request().currency }}
          </div>
        </ng-template>
      </p-card>

      <p-card styleClass="shadow-sm h-full">
        <ng-template pTemplate="content">
          <label class="text-sm text-surface-500">Revolving</label>
          <div class="text-xl font-semibold text-surface-900 mt-1">
            {{ request().isRevolving ? 'Sí' : 'No' }}
          </div>
        </ng-template>
      </p-card>

      <p-card styleClass="shadow-sm h-full">
        <ng-template pTemplate="content">
          <label class="text-sm text-surface-500">Tipo de interés</label>
          <div class="text-xl font-semibold text-surface-900 mt-1">
            {{ request().interestRate | number:'1.2-2' }}%
          </div>
        </ng-template>
      </p-card>
    </div>
  `
})
export class CreditCardFieldsComponent {
  request = input.required<RequestDetails>();
}
