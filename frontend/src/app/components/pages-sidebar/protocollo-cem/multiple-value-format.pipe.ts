
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'multipleValueFormat' })
export class MultipleValueFormatPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      value = null;
    }

    return value.replace("[",'');
  }
}
