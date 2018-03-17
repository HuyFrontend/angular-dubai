import { StatusService } from 'services';
import { Component, OnInit, Input } from '@angular/core';
import { TextCellComponent } from './textCell.component';

@Component({
  selector: 'status-cell',
  template: '<span class="{{getStatusClass(value)}} {{cssClass}}">{{formatter(value, entry)}}</span>',
  styleUrls: ['dataCell.component.scss']
})

export class StatusCellComponent extends TextCellComponent {
  constructor(public statusService: StatusService) {
    super();
	}
	
	ngOnInit() {
		if(!this.formatter) {
			this.formatter = this.statusFormatter;
		}
	}

	statusFormatter(value, entry) {
		return this.statusService.getFormattedStatus(value);
	}

	getStatusClass(status) {	
		let classStr = '';
		status = status ? status.toLowerCase() : '';
		switch(status) {
			case 'live':
			case 'active':
			case 'pendinglive':
			case 'partiallive':	
				return 'text-success text-capitalize';
			case 'modified':
			case 'draft':
			case 'updated':
				return 'text-warning text-capitalize';
			case 'inactive':
				return 'text-danger text-capitalize';
			default:
				return 'text-capitalize';
		}
	}
}
