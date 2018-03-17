import { Component, ViewEncapsulation } from '@angular/core';
import { Routes, Router, NavigationEnd } from '@angular/router';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

// import { Notificat } from 'models';
import { IAppState, LayoutActions } from 'state';

import 'core/prototype';

@Component({
    selector: 'mbc-app',
    encapsulation: ViewEncapsulation.Emulated,
    styleUrls: ['./sass/app.scss'],
    template: `
        <div [class.hide]="!isLoggedIn | async" class="page-container"
            [class.sidebar-collapsed]="isMenuCollapsed | async">
            <mbc-sidebar *ngIf="isLoggedIn | async"></mbc-sidebar>
            <div class="page-content">
                <mbc-topbar *ngIf="isLoggedIn | async"> </mbc-topbar>
                <div class="page-content-wrap">
                  <mbc-notification></mbc-notification>
                  <router-outlet></router-outlet>
                </div>
            </div>
        </div>
    `
})

export class AppComponent{
  @select(['layout', 'isMenuCollapsed']) isMenuCollapsed: Observable<boolean>;
  @select(['layout', 'isLoggedIn']) isLoggedIn: Observable<boolean>;

  constructor(private router: Router) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd){
        window.scrollTo(0,0);
      }
    });
  }
}
