import { Component, Input } from '@angular/core';

@Component({
    selector: 'tab-header',
    styleUrls: ['tab-header.scss'],
    template: `
    <ng-template tabHeading>
        {{tabName}} <i *ngIf="isShowRedFlag" class="fa fa-warning"></i>
    </ng-template>
    `
})

export class TabHeaderComponent {
    
    @Input() tabName:string;

    @Input() isShowRedFlag:boolean;
}