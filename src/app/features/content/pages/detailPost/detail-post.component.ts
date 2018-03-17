import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';

import { PostActions } from 'state';
import { Post } from 'models';

@Component({
    selector: 'content-content-detail',
    template: `<post-form action="edit"></post-form>`
})

export class DetailPostComponent implements OnInit {
    @select(['content', 'form', 'post']) post: Observable<Post>;

    public entityId: string;
    constructor(
        private route:ActivatedRoute,
        private postActions: PostActions) {
        this.route.params.subscribe(params => {
            this.entityId = params['entityId'];
            this.postActions.fetchPost(this.entityId);
        });
    }

    ngOnInit() {}
}
