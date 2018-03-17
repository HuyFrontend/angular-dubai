import { Directive, Input } from '@angular/core';
import * as moment from 'moment';

import {
  NG_VALIDATORS,
  AbstractControl,
} from '@angular/forms';


@Directive({
  selector: '[formatteddate][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: DateValueValidator, multi: true }
  ]
})
export class DateValueValidator {
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() mode?: string;
  @Input() dateFormat?: string;

  validate(control: AbstractControl): { [validator: string]: string } {
    let start = this.startDate,
        end = this.endDate;

    if (!this.startDate) {
      start = control.value;
    }

    if (!this.endDate) {
      end = control.value;
    }

    if (start && end && start > end) {
      return { formatteddate: 'End date should be after start date' };
    }

    if (!control.value) { // the [required] validator will check presence, not us
      return null;
    }

    if(control.value && control.value.date){
      return null;
    }

    if (!this.dateFormat) {
      if (this.mode === 'daytime') {
        this.dateFormat = 'YYYY-MM-DD HH:mm';
      } else {
        this.dateFormat = 'YYYY-MM-DD';
      }
    }
    if (moment(control.value, this.dateFormat, true).isValid()) {
      return null;
    }

    return { formatteddate: 'Invalid date format' };
  }
}
