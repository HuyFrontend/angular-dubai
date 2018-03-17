import {
  Component,
  Optional,
  Inject,
  Input,
  ViewChild,
  EventEmitter,
  Output
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

import { SelectModel } from './select-model';

@Component({
  selector: 'select-input',
  templateUrl: 'selectInput.component.html',
  styleUrls: ['selectInput.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: SelectInputComponent,
    multi: true,
  }],
})

export class SelectInputComponent extends ValueAccessorBase<string> {
  @ViewChild(NgModel) model: NgModel;

  @Input('title') public title: string;
  @Input('name') public name: string;
  @Input('guideText') public guideText?: string = '';
  @Input('placeholder') public placeholder?: string = '';
  @Input('datasource') public datasource: [SelectModel];
  @Input('requiredMessage') public requiredMessage?: string = '';
  @Input('isReadOnly') isReadOnly: boolean = false;
  @Output() selectInputChange = new EventEmitter<any>();

  ngOnInit() {
    //if (!this.placeholder && this.title) {
      //this.placeholder = `Enter ${this.title} Here.`
    //}
    if (!this.guideText) {
      this.guideText = this.placeholder
    }
  }

  onChange(){
    this.selectInputChange.emit({new:this.model.value, old:this.model.model});
  }
}
