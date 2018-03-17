import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { NOTIFICATION_TYPE } from 'constant';
import { PageActions, AlertsActions } from 'state';
import { PageModel } from 'models';

@Component({
    selector: 'page-create',
    templateUrl: 'page-create.html'
})

export class PageCreateComponent implements OnInit {

    @select(['page', 'form', 'page']) pageModel: Observable<PageModel>;
    public copyFromId: string;

    constructor(
        private pageActions: PageActions,
        private alertsActions: AlertsActions,
        private activeRoute: ActivatedRoute,
        private router: Router
    ) {
        this.pageActions.fetchConfigByTypes();

        this.activeRoute.queryParams.subscribe(params => {
            this.copyFromId = params['copyFromId'];
            if (this.copyFromId) {
                this.pageActions.copyPage(this.copyFromId);
            } else {
                this.pageActions.addPage();
            }
        });
    }

    ngOnInit() { }
}
