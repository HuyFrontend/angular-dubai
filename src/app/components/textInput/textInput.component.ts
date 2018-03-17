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
  ValueAccessorBase,
  animations
} from '../form';

@Component({
  selector: 'text-input',
  templateUrl: 'textInput.component.html',
  styleUrls: ['textInput.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: TextInputComponent,
    multi: true,
  }],
})

export class TextInputComponent extends ValueAccessorBase<string> {
  @ViewChild(NgModel) model: NgModel;

  @Input('title') public title: string;
  @Input('type') public type: string = 'text';

  @Input('guideText') public guideText?: string = '';
  @Input('placeholder') public placeholder?: string;
  @Input('maxLength') public maxLength?: number = 250;
  @Input('required') public required?: boolean = false;
  @Input('hideHelpText') public hideHelpText?: boolean = false;
  @Input('readOnly') public readOnly?: boolean = false;
  @Input('requiredMessage') public requiredMessage?: string = '';
  public originalValue?: string = '';

  ngOnInit() {
    if (!this.guideText) {
      this.guideText = this.placeholder
    }
  }
}
