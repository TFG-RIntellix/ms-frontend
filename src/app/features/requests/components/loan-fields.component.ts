import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { RequestDetails } from '../../../core/models/request.model';
import { CurrencyValuePipe } from '../../../shared/ui/currency-value/currency-value.pipe';
import { PurposeLabelPipe } from '../../../shared/pipes/purpose-label.pipe';

@Component({
  selector: 'app-loan-fields',
  standalone: true,
  imports: [CommonModule, CardModule, CurrencyValuePipe, PurposeLabelPipe],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <p-card styleClass="shadow-sm h-full">
        <ng-template pTemplate="content">
          <label class="text-sm text-surface-500">Importe solicitado</label>
          <div class="text-xl font-semibold text-surface-900 mt-1">
            {{ request().requestedAmount | currencyValue:request().currency }}
          </div>
        </ng-template>
      </p-card>

      <p-card styleClass="shadow-sm h-full">
        <ng-template pTemplate="content">
          <label class="text-sm text-surface-500">Plazo</label>
          <div class="text-xl font-semibold text-surface-900 mt-1">
            {{ request().requestTermMonths }} meses
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

      <p-card styleClass="shadow-sm h-full">
        <ng-template pTemplate="content">
          <label class="text-sm text-surface-500">Finalidad</label>
          <div class="text-lg font-medium text-surface-900 mt-1">
            {{ request().purpose | purposeLabel }}
          </div>
        </ng-template>
      </p-card>

      <p-card styleClass="shadow-sm h-full">
        <ng-template pTemplate="content">
          <label class="text-sm text-surface-500">Tipo de préstamo</label>
          <div class="text-lg font-medium text-surface-900 mt-1">{{ request().loanType ?? '-' }}</div>
        </ng-template>
      </p-card>

      <p-card styleClass="shadow-sm h-full">
        <ng-template pTemplate="content">
          <label class="text-sm text-surface-500">Sistema de amortización</label>
          <div class="text-lg font-medium text-surface-900 mt-1">{{ request().repaymentSystem ?? '-' }}</div>
        </ng-template>
      </p-card>
    </div>
  `
})
export class LoanFieldsComponent {
  request = input.required<RequestDetails>();
}
