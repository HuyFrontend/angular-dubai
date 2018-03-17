import {
  Component, Input, ContentChild,
} from '@angular/core';
import { TextCellComponent } from '../cell/textCell.component';

@Component({
  selector: 'column',
  template: ''
})

export class ColumnComponent {
  @Input('css-class') cssClass: string;
  @Input() key: string = "id";
  @Input() display: string = "value";
  @Input() type: string;
  @Input() value: string;
  @Input() isHaveDefault: boolean;
  @Input() defaultValue: any;
  @Input() defaultText: string;
  @Input() datasource: Array<any>;
  @Input() tooltipContent: string;
  @Input() imageUrl: string;
  @Input() getLink: Function;
  @Input() formatter: Function;
  @Input() disabled: boolean;
}
