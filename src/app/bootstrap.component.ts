import { Component, ViewEncapsulation } from '@angular/core';
import { NgRedux, DevToolsExtension } from '@angular-redux/store';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { createLogger } from 'redux-logger';
import {
    Router,
    // import as RouterEvent to avoid confusion with the DOM Event
    Event as RouterEvent,
    NavigationStart,
    NavigationEnd,
    NavigationCancel,
    NavigationError
} from '@angular/router'

import { LayoutActions } from 'state';
import { IAppState, rootReducer } from 'state';
import { isDevelopmentMode } from 'utils';
import * as MBCQuillConfiguration  from 'utils/quill-configuration';

@Component({
    selector: 'ng-app',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./sass/mbc-custom.scss'],
    template: `
        <mbc-app>
            <router-outlet></router-outlet>
        </mbc-app>
        <spinner></spinner>
    `
})

export class BootstrapComponent {
    constructor(
        private layoutActions: LayoutActions,
        private router: Router,
        private ngRedux: NgRedux<IAppState>,
        private devTools: DevToolsExtension
    ) {
         router.events.subscribe((event: RouterEvent) => {
            this.navigationInterceptor(event);
        });
        // Check the enviroment then ignore redux logger.
        if (isDevelopmentMode()) {
            const enhancers = [devTools.isEnabled() ? devTools.enhancer() : f => f  ];
            ngRedux.configureStore(rootReducer, {}, [createLogger()], enhancers);
        } else {
            ngRedux.configureStore(rootReducer, {}, []);
        }
        MBCQuillConfiguration.configQuillEditor();

    }

     // Shows and hides the loading spinner during RouterEvent changes
    navigationInterceptor(event: RouterEvent): void {
        if (event instanceof NavigationStart) {
            this.layoutActions.showLoading();
        }
        if (event instanceof NavigationEnd) {
            this.layoutActions.hideLoading();
        }

        // Set loading state to false in both of the below events to hide the spinner in case a request fails
        if (event instanceof NavigationCancel) {
            this.layoutActions.hideLoading();
        }
        if (event instanceof NavigationError) {
            this.layoutActions.hideLoading();
        }
    }
}
