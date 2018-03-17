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
  selector: 'datetime-picker',
  templateUrl: 'datetime-picker.component.html',
  styleUrls: ['datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: DatetimePickerComponent,
    multi: true,
  }],
})

export class DatetimePickerComponent extends ValueAccessorBase<any>{
  @ViewChild(NgModel) model: NgModel;

  @Input() name: string;
  @Input() placeholder: string = '';
  @Input() mode?: string = 'day'; // available modes: day | month | time | daytime
  @Input() theme?: string = 'dp-material';
  @Input() dateFormat?: string = '';

  @Input() public title: string = '';
  @Input() public guideText?: string = '';
  @Input() public isDisabled?: string = null;
  @Input() public isInputDisabled?: string = null;
  @Input() public isSuggestion?: string = null;
  @Input() public config? = {
    format: this.dateFormat,
    allowMultiSelect: false,
    closeOnSelect: true,
    showTwentyFourHours: true,
    disableKeypress: true,
    drops: 'down', // up | down (show below or above)
  };
  @Input() public isHideGuideText: boolean = false;
  @Output() dateChangeEvent = new EventEmitter<any>();

  public id: string = '';

  ngOnInit() {
    this.id = `id-${this.name}`;

    if (!this.guideText) {
      this.guideText = this.placeholder
    }

    if (!this.dateFormat) {
      if (this.mode === 'daytime') {
        this.dateFormat = 'YYYY-MM-DD HH:mm';
      } else {
        this.dateFormat = 'YYYY-MM-DD';
      }
    }
    this.config.format = this.dateFormat;

    if (this.isSuggestion) {
      this.model.update.subscribe(val => {
        this.dateChangeEvent.emit(val);
        setTimeout(this.clearValue.bind(this), 0);
      });
    }
  }

  clearValue() {
    this.writeValue('');
  }

  onKeyPressed(event) {
    if (this.isInputDisabled) {
      event.preventDefault();
    }
  }
}
