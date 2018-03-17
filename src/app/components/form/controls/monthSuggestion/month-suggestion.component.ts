import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DatetimePickerComponent } from './../datetimePicker/datetime-picker.component';
import {
  Component,
  Optional,
  Inject,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  ViewEncapsulation,
  SimpleChanges,
} from '@angular/core';

import {
  NgModel,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  NG_ASYNC_VALIDATORS,
} from '@angular/forms';

import {
  animations,
  ValueAccessorBase,
} from 'components/form';

import * as moment from 'moment';

@Component({
  selector: 'month-suggestion',
  templateUrl: 'month-suggestion.component.html',
  styleUrls: ['month-suggestion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: MonthSuggestionComponent,
    multi: true,
  }],
})

export class MonthSuggestionComponent extends ValueAccessorBase<any>{
  @ViewChild(NgModel) model: NgModel;
  @ViewChild('datetimePicker') datetimePicker: DatetimePickerComponent;

  @Input() name: string;
  @Input() placeholder: string = 'Select month and year';

  @Output() addSuggestionEvent: EventEmitter<any> = new EventEmitter<any>();

  public config = {
    format: 'MM-DD',
    allowMultiSelect: false,
    closeOnSelect: true,
    drops: 'down', // up | down (show below or above)
  };

  public listSelected: any[];
  public listStream$: BehaviorSubject<any>;

  ngOnInit() {
    this.listSelected = [];
    this.listStream$ = new BehaviorSubject(this.listSelected);
    this.listStream$.subscribe(value => {
      this.addSuggestionEvent.emit(value);
    });
  }

  onDateSelected(date) {
    if (!this.isDuplicate(date)) {
      this.listSelected.push({id: date, value: date});
      this.listStream$.next(this.listSelected);
    }
  }

  onRemove(item) {
    this.listSelected.splice(item, 1);
    this.listStream$.next(this.listSelected);
  }

  isDuplicate(date): boolean {
    return this.listSelected.find(item => item.value === date);
  }

  resetSuggestionList() {
    this.listSelected = [];
    this.listStream$.next(this.listSelected);
  }
}
