import {
  Component, Input, Output, EventEmitter
} from '@angular/core';

@Component({
  selector: 'table-action',
  template: ``
})

export class TableActionComponent {
  @Input() name: string;
  @Input() title: string;
  @Input() condition: Function;
  @Output() doAction = new EventEmitter<any>();
}
