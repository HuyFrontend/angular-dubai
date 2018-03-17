import { Component, OnInit, Input } from '@angular/core';
import { LinkCellComponent } from './linkCell.component';

@Component({
  selector: 'mixed-image-cell',
  styleUrls: ['dataCell.component.scss'],
  template: `<div>
              <div *ngIf="imageUrl" class="image-cell">
                  <img src="{{imageUrl}}" class="image"/>
              </div>
              <div>
                <a [routerLink]="getLink(entry)">{{formatter(value, entry)}}</a>
              </div>
            </div>`
})

export class MixedImageCellComponent extends LinkCellComponent {
	@Input() imageUrl: string;
}
