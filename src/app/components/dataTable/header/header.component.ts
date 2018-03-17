import {
  Component, Input
} from '@angular/core';

@Component({
  selector: 'header',
  template: ''
})

export class HeaderComponent {
  @Input() title: string;
  @Input() name: string;
  @Input() sortable: boolean = true;
}
