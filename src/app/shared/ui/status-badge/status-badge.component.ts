import { Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { statusLabel, statusSeverity } from '../../../core/utils/labels';

@Component({
  selector: 'app-status-badge',
  standalone: true,
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
