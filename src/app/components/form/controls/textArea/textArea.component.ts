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
} from 'components/form';

@Component({
  selector: 'text-area',
  templateUrl: 'textArea.component.html',
  styleUrls: ['textArea.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: TextAreaComponent,
    multi: true,
  }],
})

export class TextAreaComponent extends ValueAccessorBase<string> {
  @ViewChild(NgModel) model: NgModel;

  @Input('title') public title: string;

  @Input('guideText') public guideText?: string = '';
  @Input('placeholder') public placeholder?: string;
  @Input('maxLength') public maxLength?: number = 250;
  @Input('required') public required?: boolean = false;
  @Input('hideHelpText') public hideHelpText?: boolean = false;
  @Input('isReadOnly') isReadOnly: boolean = false;
  public originalValue?: string = '';

  ngOnInit() {
    if (!this.guideText) {
      this.guideText = this.placeholder
    }
  }
}
