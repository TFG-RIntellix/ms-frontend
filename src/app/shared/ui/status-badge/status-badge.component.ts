import { Component, computed, input , ChangeDetectionStrategy} from '@angular/core';
import { TagModule } from 'primeng/tag';
import { statusLabel, statusSeverity } from '../../../core/utils/labels';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-status-badge',
  imports: [TagModule],
  template: `
    <p-tag [value]="label()" [severity]="severity()" />
  `
})
export class StatusBadgeComponent {
  status = input.required<string>();
  label = computed(() => statusLabel[this.status()] ?? this.status());
  severity = computed(() => statusSeverity[this.status()] ?? 'info');
}
