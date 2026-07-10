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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <p-card styleClass="rounded-xl shadow-sm border-t-4 border-t-primary-500 h-full">
        <ng-template pTemplate="content">
          <label class="text-base font-bold text-surface-800">Límite de crédito solicitado</label>
          <div class="text-2xl font-bold text-surface-900 mt-2">
            {{ request().requestedCreditLimit | currencyValue:request().currency }}
          </div>
        </ng-template>
      </p-card>

      <p-card styleClass="rounded-xl shadow-sm border-t-4 border-t-primary-500 h-full">
        <ng-template pTemplate="content">
          <label class="text-base font-bold text-surface-800">Revolving</label>
          <div class="text-2xl font-bold text-surface-900 mt-2">
            {{ request().isRevolving ? 'Sí' : 'No' }}
          </div>
        </ng-template>
      </p-card>

      <p-card styleClass="rounded-xl shadow-sm border-t-4 border-t-primary-500 h-full">
        <ng-template pTemplate="content">
          <label class="text-base font-bold text-surface-800">Tipo de interés</label>
          <div class="text-2xl font-bold text-surface-900 mt-2">
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
