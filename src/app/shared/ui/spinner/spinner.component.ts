import { Component, input , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-spinner',
  imports: [CommonModule],
  template: `
    @if (overlay()) {
      <div class="flex justify-center items-center" [style.height]="height()">
        <div class="rintellix-spinner"></div>
      </div>
    } @else {
      <div class="rintellix-spinner"></div>
    }
  `
})
export class SpinnerComponent {
  overlay = input(true);
  height = input('100%');
}
