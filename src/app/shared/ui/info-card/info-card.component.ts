import { Component, input , ChangeDetectionStrategy} from '@angular/core';
import { CardModule } from 'primeng/card';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-info-card',
  imports: [CardModule],
  template: `
    <p-card styleClass="rounded-xl shadow-sm border border-surface-200 border-t-4 border-t-primary-500 h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 bg-white">
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
