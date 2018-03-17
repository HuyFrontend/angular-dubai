import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';

import { ContentActions, FormActions } from 'state';
import { Article } from 'models';

@Component({
    selector: 'content-create-article',
    template: 
        `
        <article-form
            [article]="article$ | async"
            [isCreate]="true">
        </article-form>
        `
})

export class CreateArticleComponent implements OnInit {
    
     @select(['form', 'values']) article$: Observable<Article>;

    constructor(
        private activeRoute:ActivatedRoute,
        private contentActions: ContentActions
        ) {
            this.activeRoute.queryParams.subscribe(params => {
                let copyFromId = params['copyFromId'];

                if (!copyFromId) {
                    this.contentActions.initArticleForm();
                }
            });
        }

    ngOnInit() {}
}