import { Component, OnInit, Input } from '@angular/core';
import { TextCellComponent } from './textCell.component';

@Component({
  selector: 'image-cell',
  template: `<div *ngIf="imageUrl" class="image-cell">
                  <img src="{{imageUrl}}" class="image"/>
             </div>`,
  styleUrls: ['dataCell.component.scss']
})

export class ImageCellComponent extends TextCellComponent {
	@Input() imageUrl: string;
}
