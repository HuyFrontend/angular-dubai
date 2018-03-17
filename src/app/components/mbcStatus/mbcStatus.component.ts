import { Component, OnInit, Input } from '@angular/core';
import { StatusService } from 'services';

@Component({
  selector: 'data-status',
  templateUrl: 'mbcStatus.component.html',

})

export class MBCStatusComponent implements OnInit {
	@Input('status') status: string;

	constructor(public statusService: StatusService) { }

	ngOnInit() {}

	getStatusClass(status: string): string {
		if (!status) return '';
		status = status.toLowerCase();
		let classStr = 'text-capitalize ';
		if (status === 'live') {
			classStr += 'text-success';
		} else if (status === 'modified'
				|| status === 'draft'
				|| status === 'updated') {
			classStr += 'text-warning';
		} else if (status === 'inactive') {
			classStr += 'text-danger';
		}
		return classStr;
	}
}
