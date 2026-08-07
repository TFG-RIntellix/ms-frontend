import { Component, computed, input , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-delta-chip',
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      [class]="toneClass()"
    >
      <i class="pi" [class]="iconClass()"></i>
      {{ prefix() }}{{ value() | number: (isCurrency() ? '1.0-0' : '1.2-2') }}
    </span>
  `
})
export class DeltaChipComponent {
  value = input.required<number>();
  isCurrency = input(false);
  invertColor = input(false);
  prefix = computed(() => (this.value() > 0 ? '+' : ''));
  toneClass = computed(() => {
    const positiveIsGood = !this.invertColor();
    const isPositive = this.value() > 0;
    if (positiveIsGood === isPositive) {
      return 'bg-green-100 text-green-800';
    }
    if (this.value() === 0) {
      return 'bg-surface-100 text-surface-700';
    }
    return 'bg-red-100 text-red-800';
  });
  iconClass = computed(() => {
    if (this.value() === 0) {
      return 'pi-minus';
    }
    return this.value() > 0 ? 'pi-arrow-up' : 'pi-arrow-down';
  });
}
