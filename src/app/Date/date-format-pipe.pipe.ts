import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormatPipe',
  standalone: true
})
export class DateFormatPipePipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}
  transform(value: any, args?: any): any {
    return this.datePipe.transform(value, 'yyyy-MM-dd');
  }

}
