import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {
  NgModel,
	NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {ValueAccessorBase} from '../../form';

@Component({
  selector: 'checkbox-cell',
	templateUrl: 'checkboxCell.component.html',
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: CheckboxCellComponent,
		multi: true,
	}],
})

export class CheckboxCellComponent extends ValueAccessorBase<any> implements OnInit {
	@ViewChild(NgModel) model: NgModel;

	@Input() value: any;
	@Input() name:string;
	@Input() disabled: boolean = false;

	ngOnInit() {
	}
}
