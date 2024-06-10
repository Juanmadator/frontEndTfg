import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

@Pipe({
  name: 'formatDate',
  standalone:true
})
export class FormatDatePipe implements PipeTransform {

  transform(value: string): string {
    const date = new Date(value);
    const now = new Date();

    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return format(date, 'dd-MM-yyyy', { locale: es });
    }
  }

}
