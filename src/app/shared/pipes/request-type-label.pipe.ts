import { Pipe, PipeTransform } from '@angular/core';
import { requestTypeLabel } from '../../core/utils/labels';
@Pipe({
  name: 'requestTypeLabel',
})
export class RequestTypeLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '-';
    return requestTypeLabel[value] ?? value;
  }
}
