import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-surface-900">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="text-surface-500 mt-1">{{ subtitle() }}</p>
      }
    </div>
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
}
