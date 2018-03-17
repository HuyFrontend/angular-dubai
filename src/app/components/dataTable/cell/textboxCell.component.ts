import { Component, OnInit, Input, ViewChild,Optional, Inject } from '@angular/core';
import {
  NgModel,
	NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {ValueAccessorBase} from '../../form';

@Component({
  selector: 'textbox-cell',
	templateUrl: 'textboxCell.component.html',
	styles: [`
						input{
							width: 100%;
						}
				`],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: TextboxCellComponent,
		multi: true,
	}],
})

export class TextboxCellComponent extends ValueAccessorBase<any> implements OnInit{
	@ViewChild(NgModel) model: NgModel;

	@Input() value: any;
	@Input() name: any;
	
	ngOnInit() {
	}

}
