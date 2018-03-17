import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import {
  NgModel,
	NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {ValueAccessorBase} from '../../form';

@Component({
  selector: 'selectbox-cell',
	templateUrl: 'selectboxCell.component.html',
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: SelectboxCellComponent,
		multi: true,
	}],
})

export class SelectboxCellComponent extends ValueAccessorBase<any> implements OnInit {
	@ViewChild(NgModel) model: NgModel;

  @Input() isHaveDefault: boolean = true;
	@Input() defaultValue: any = '';
	@Input() defaultText: string = 'Select';
	@Input() value: any;
	@Input() name: any;
	@Input() datasource: any[];
	@Input() disabled: boolean = false;

  @Output() itemSelectChange = new EventEmitter<any>();

	ngOnInit() {

  }

  onSelectionChange($event: Event){
    $event.stopPropagation();
    this.itemSelectChange.emit($event);
  }
}
