import { Pipe, PipeTransform } from '@angular/core';
import { purposeLabel } from '../../core/utils/labels';

@Pipe({
  name: 'purposeLabel',
  standalone: true
})
export class PurposeLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '-';
    return purposeLabel[value] ?? value;
  }
}
