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

@Component({
  selector: 'radio-group',
  templateUrl: 'radio-group.component.html',
  styleUrls: ['radio-group.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: RadioGroupComponent,
    multi: true,
  }],
})

export class RadioGroupComponent extends ValueAccessorBase<any>{
  @ViewChild(NgModel) model: NgModel;

  @Input() name: string;
  @Input() dataSource: any[];

  @Input('title') public title: string;

  @Input('guideText') public guideText?: string = '';

  @Output() radioGroupChange = new EventEmitter<any>();

  onChange($event){
    this.radioGroupChange.emit($event);
  }

  ngOnInit() {
  }
}
