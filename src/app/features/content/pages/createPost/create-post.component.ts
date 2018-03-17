import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';
import { PostActions } from 'state';
import { Post } from 'models';

@Component({
    selector: 'content-create-post',
    template: `<post-form [action]="action"></post-form>`
})

export class CreatePostComponent implements OnInit {
  public action: string = 'create';

  constructor(
    private activeRoute:ActivatedRoute,
    private postActions: PostActions) {
      this.activeRoute.queryParams.subscribe(params => {
      let copyFromId = params['copyFromId'];
      this.action = copyFromId ? 'create' : 'copy';

      if (!copyFromId) {
        this.postActions.initPostForm();
      }
    });
  }

  ngOnInit() {
  }
}
