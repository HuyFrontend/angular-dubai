import {
  Component, EventEmitter, Output,
  OnInit, ViewEncapsulation, Input
} from '@angular/core';
@Component({
  selector: 'bulk-action',
  templateUrl: 'bulk-action.html',
  styleUrls: ['bulk-action.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BulkActionComponent {

  @Input() bulkActions: Array<any> = [];
  
  @Output() onBulkAction = new EventEmitter<any>();

  ngOnInit() {
  }

  doBulkAction($event) {
    this.onBulkAction.emit($event);
  }

}
