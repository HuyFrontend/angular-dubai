import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MyDatePicker } from 'mydatepicker';

@Component({
  selector: 'mbc-datepicker',
  template: `
        <my-date-picker [(ngModel)]="myDatePickerModel" [placeholder]="placeholder" [options]="defaulOptions"
                (dateChanged)="onDateChanged($event)"
                (inputFieldChanged)="onInputFieldChanged($event)"></my-date-picker>
    `,
  styleUrls: ['./mbc-datepicker.components.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MBCDatepickerComponent implements OnInit {
  @ViewChild('dp') ngxdp: MyDatePicker;
  public myDatePickerModel: any;
  @Input() date: string;
  @Input() required?: string;
  @Input() fControl: FormControl;
  @Input() pickerOptions?: any;

  @Input() placeholder: string;

  @Input() disableSince: boolean = true;

  public defaulOptions = {
    dateFormat: 'dd-mm-yyyy',
    firstDayOfWeek: 'mo'
  }
  constructor() { }

  ngOnInit() {
    if (this.disableSince) {
      this.defaulOptions['disableSince'] = {
        year: (new Date()).getFullYear(),
        month: (new Date()).getMonth() + 1,
        day: (new Date()).getDate()
      }
    }

    if (!this.date && this.required) {
      this.fControl.setErrors({ required: true });
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.date) {
      const _dateStr = this.date;
      const _date = new Date(_dateStr);
      if (_date) {
        const convertedDate = {
          date: {
            year: _date.getFullYear(),
            month: _date.getMonth() + 1,
            day: _date.getDate()
          }
        }
        this.myDatePickerModel = convertedDate;
        this.fControl.setErrors(null);
      }
    } else {
      this.myDatePickerModel = '';
      if (this.required) {
        this.fControl.setErrors({ required: true });
      }
    }
  }

  onInputFieldChanged($event) {
    if (this.fControl) {
      this.fControl.setErrors(null);

      if ($event.value != '' && !$event.valid) {
        this.fControl.setErrors({ invalidFormat: true, required: false });
      }
      if (!this.date && !$event.value && this.required) {
        this.fControl.setErrors({ required: true });
      }
    }
  }
  onDateChanged($event) {
    if (this.fControl) {
      this.fControl.setValue($event.jsdate);
    }
  }
}
