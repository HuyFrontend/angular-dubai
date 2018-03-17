import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'loading',
  templateUrl: 'mbcLoading.component.html',
  styleUrls: ['mbcLoading.component.scss']
})

export class MBCLoadingComponent implements OnInit {
	@Input('text') text: any;
	constructor() { }

	ngOnInit() {

	}
}
