import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'text-cell',
  templateUrl: 'textCell.component.html',
  styleUrls: ['dataCell.component.scss']
})

export class TextCellComponent implements OnInit {
	@Input() cssClass: string;
	@Input() value: any;
	@Input() tooltipContent: any;
	@Input() entry: any;
	@Input() formatter: Function;

	ngOnInit() {
		if(!this.formatter) {
			this.formatter = this.plainTextFormatter;
		}
	}

	plainTextFormatter(text, entry) {
		return text;
	}
}
