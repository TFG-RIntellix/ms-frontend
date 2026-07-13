import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestDetails } from '../../../core/models/request.model';
import { CurrencyValuePipe } from '../../../shared/ui/currency-value/currency-value.pipe';
import { InfoCardComponent } from '../../../shared/ui/info-card/info-card.component';

@Component({
  selector: 'app-credit-card-fields',
  standalone: true,
  imports: [CommonModule, InfoCardComponent, CurrencyValuePipe],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <app-info-card label="Límite de crédito solicitado">
        {{ request().requestedCreditLimit | currencyValue:request().currency }}
      </app-info-card>

      <app-info-card label="Revolving">
        {{ request().isRevolving ? 'Sí' : 'No' }}
      </app-info-card>

      <app-info-card label="Tipo de interés">
        {{ request().interestRate | number:'1.2-2' }}%
      </app-info-card>
    </div>
  `
})
export class CreditCardFieldsComponent {
  request = input.required<RequestDetails>();
}
