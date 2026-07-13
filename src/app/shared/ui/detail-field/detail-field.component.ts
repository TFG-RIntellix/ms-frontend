import { Component, input } from '@angular/core';

@Component({
  selector: 'app-detail-field',
  standalone: true,
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
