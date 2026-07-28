import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (overlay) {
      <div class="flex justify-center items-center" [style.height]="height">
        <div class="rintellix-spinner"></div>
      </div>
    } @else {
      <div class="rintellix-spinner"></div>
    }
  `
})
export class SpinnerComponent {
  @Input() overlay = true;
  @Input() height = '100%';
}
