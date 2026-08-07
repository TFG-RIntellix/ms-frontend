import { Component, input , ChangeDetectionStrategy} from '@angular/core';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-detail-field',
  template: `
    <div>
      <label class="text-sm text-surface-500">{{ label() }}</label>
      <p class="font-medium text-surface-900"><ng-content /></p>
    </div>
  `
})
export class DetailFieldComponent {
  label = input.required<string>();
}
