import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';

import { NOTIFICATION_TYPE } from 'constant';
import { PageActions, AlertsActions } from 'state';
import { PageModel } from 'models';
/**
 * 
 * 
 * @export
 * @class PageDetailComponent
 * @implements {OnInit}
 */
@Component({
    selector: 'page-detail',
    styleUrls: ['page-detail.scss'],
    templateUrl: 'page-detail.component.html'
})

export class PageDetailComponent {

    @select(['page', 'form', 'page']) pageModel: Observable<PageModel>;
    private pageId: string;

    constructor(
        private route:ActivatedRoute,
        private pageActions: PageActions,
        private alertsActions: AlertsActions) {
            this.pageActions.fetchConfigByTypes();
        this.route.params.subscribe(params => {
            this.pageId = params['pageId'];
            this.pageActions.fetchPageById(this.pageId)
        });
    }
    onSaveNewPage(pageModel: PageModel) {
        this.pageActions.savePage(pageModel).subscribe();
    }
}