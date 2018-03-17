import { Component, OnInit, Input } from '@angular/core';
import { TextCellComponent } from './textCell.component';

@Component({
  selector: 'link-cell',
  template: '<a [routerLink]="getLink(entry)" class="{{cssClass}}">{{formatter(value, entry)}}</a>',
  styleUrls: ['dataCell.component.scss']
})

export class LinkCellComponent extends TextCellComponent {
    @Input() getLink: Function;

}
