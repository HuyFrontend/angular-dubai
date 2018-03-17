import { Component, Input } from '@angular/core';

@Component({
    selector: 'mbc-page-title',
    template: `
    <div class="page-title">
        <h2><span class="fa fa-arrow-circle-o-left"></span>{{ pageTitle }}</h2>
    </div>
    `
})

export class MBCPageTitleComponent {
    @Input() pageTitle: string;
    constructor() { }
}