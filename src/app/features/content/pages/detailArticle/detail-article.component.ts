import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';

import { ContentActions } from 'state';
import { Article } from 'models';

@Component({
    selector: 'content-detail-article',
    template: `<article-form [article]="article$ | async" [isCreate]="false" [action]="'edit'"></article-form>`
})

export class DetailArticleComponent implements OnInit {
    public entityId: string;
    @select(['form', 'values']) article$: Observable<Article>;

    constructor(
        private activeRoute:ActivatedRoute,
        private contentActions: ContentActions) {
        this.activeRoute.params.subscribe(params => {
            this.entityId = params['entityId'];

            this.contentActions.fetchArticle(this.entityId);
        });
    }
    ngOnInit() {}
}