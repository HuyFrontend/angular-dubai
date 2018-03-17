import { Component } from '@angular/core';
import { select } from '@angular-redux/store';

@Component({
  selector: 'mbc-breadcumb',
  template: 
  `<ul class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li class="active">Dashboard</li>
    </ul>`,
  styleUrls: ['mbc-breadcumb.scss']
})

export class MBCBreadcumb {
  constructor() {}
}
