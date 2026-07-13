import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestDetails } from '../../../core/models/request.model';
import { CurrencyValuePipe } from '../../../shared/ui/currency-value/currency-value.pipe';
import { PurposeLabelPipe } from '../../../shared/pipes/purpose-label.pipe';
import { InfoCardComponent } from '../../../shared/ui/info-card/info-card.component';

@Component({
  selector: 'app-mortgage-fields',
  standalone: true,
  imports: [CommonModule, InfoCardComponent, CurrencyValuePipe, PurposeLabelPipe],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <app-info-card label="Importe solicitado">
        {{ request().requestedAmount | currencyValue:request().currency }}
      </app-info-card>

      <app-info-card label="Valor de la propiedad">
        {{ request().propertyValue | currencyValue:request().currency }}
      </app-info-card>

      <app-info-card label="Primera vivienda">
        {{ request().isFirstHome ? 'Sí' : 'No' }}
      </app-info-card>

      <app-info-card label="Plazo">
        {{ request().requestTermMonths }} meses
      </app-info-card>

      <app-info-card label="Tipo de interés">
        {{ request().interestRate | number:'1.2-2' }}%
      </app-info-card>

      <app-info-card label="Finalidad">
        {{ request().purpose | purposeLabel }}
      </app-info-card>

      <app-info-card label="Tipo de hipoteca">
        {{ request().loanType ?? '-' }}
      </app-info-card>

      <app-info-card label="Sistema de amortización">
        {{ request().repaymentSystem ?? '-' }}
      </app-info-card>
    </div>
  `
})
export class MortgageFieldsComponent {
  request = input.required<RequestDetails>();
}
