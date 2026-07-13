import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CardModule],
  template: `
    <p-card styleClass="rounded-xl shadow-sm border-t-4 border-t-primary-500 h-full">
      <ng-template pTemplate="content">
        <label class="text-base font-bold text-surface-800">{{ label() }}</label>
        <div class="text-2xl font-bold text-surface-900 mt-2">
          <ng-content />
        </div>
      </ng-template>
    </p-card>
  `
})
export class InfoCardComponent {
  label = input.required<string>();
}
