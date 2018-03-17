import {Component, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'validation',
  template: `
    <div *ngIf="errors.length">
      <label class="error" *ngFor="let message of errors">{{message}}</label>
    </div>
    `
})
export class ValidationComponent implements OnChanges {
  @Input() messages:any;
  @Input() requiredMessage?: string;
  public errors: Array<String> = [];

  ngOnChanges(changes) {
    if(!changes.messages || !changes.messages.currentValue) {
      this.errors = [];
    } else {
      if(changes.messages.currentValue instanceof Array) {
        this.errors = changes.messages.currentValue;
      } else {
        this.errors = Object.keys(changes.messages.currentValue).filter(m => m !== 'required').map(m => changes.messages.currentValue[m]);
      }
      if (this.requiredMessage && Object.keys(changes.messages.currentValue).filter(m => m === 'required').length) {
        this.errors.unshift(this.requiredMessage);
      }
    }
  }
}
