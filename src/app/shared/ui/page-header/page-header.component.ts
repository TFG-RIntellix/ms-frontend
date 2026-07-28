import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-page-header',
  imports: [],
  template: `
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-surface-900 tracking-tight">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="text-surface-500 mt-1.5 text-lg">{{ subtitle() }}</p>
      }
    </div>
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
}
