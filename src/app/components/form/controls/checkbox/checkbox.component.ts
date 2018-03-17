import {
  Component,
  Optional,
  Inject,
  Input,
  ViewChild,
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
} from '../../../form';

@Component({
  selector: 'checkbox',
  templateUrl: 'checkbox.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: CheckboxComponent,
    multi: true,
  }],
})

export class CheckboxComponent extends ValueAccessorBase<string> {
  @ViewChild(NgModel) model: NgModel;

  @Input('title') public title: string;
  @Input('guideText') public guideText?: string = '';

  public originalValue?: string = '';
}
