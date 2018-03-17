import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'action-cell',
  templateUrl: 'actionCell.component.html',
  styleUrls: ['actionCell.component.scss']
})

export class ActionCellComponent implements OnInit {
  
  @Input('remove') remove: boolean;
  @Input('up') up: boolean;
  @Input('down') down: boolean;
  @Input('default') default: boolean;
  @Input('is-default') isDefaut: boolean;
  @Input('display-loader') displayLoader: boolean;

  @Output() removeAction = new EventEmitter<any>();
  @Output() moveUpAction = new EventEmitter<any>();
  @Output() moveDownAction = new EventEmitter<any>();
  @Output() defaultAction = new EventEmitter<any>();

	ngOnInit() {
		
  }
}
