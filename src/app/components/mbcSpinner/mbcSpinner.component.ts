import { Component } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'spinner',
  templateUrl: 'mbcSpinner.component.html'
})

export class MBCSpinnerComponent {
  @select(['layout', 'isLoading']) isLoading: Observable<boolean>;
  constructor() { }
}