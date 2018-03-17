import { Component, ViewChild, AfterViewInit, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { select } from '@angular-redux/store';
import { NgForm } from '@angular/forms';
import { App } from 'models';
import { AppActions } from 'state';
import { APP_STATUS } from 'constant';
import { getInterestSuggestions, getAllInterestNode } from 'utils/config-helper';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { PageService, AppConfigService } from 'services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
@Component({
  selector: 'app-options',
  styleUrls: ['app-options.scss'],
  templateUrl: 'app-options.html',
})

export class AppOptionsComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('optionsForm') form: NgForm;
  @select(['forms', 'app']) app$: Observable<App>;

  public app: App = new App();
  private appSubscription: Subscription;
  public appStatus = APP_STATUS;

  constructor(private appAction: AppActions, private pageService: PageService, private configServive: AppConfigService) {
  }

  ngOnInit() {
    this.appSubscription = this.app$.subscribe(appData => {
      if (appData) {
        this.app = appData;
      }
    });
  }

  ngAfterViewInit() {
    this.form.valueChanges
      .subscribe(values => this.appAction.updateState(values));
  }

  ngOnDestroy() {
    this.form.resetForm();
    this.appSubscription.unsubscribe();
  }

  isValid(isSubmitting = false): boolean {
    if (isSubmitting) {
      this.form.form.controls.name.markAsDirty();
      this.form.form.controls.label.markAsDirty();
    }
    return !this.form.invalid;
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

}
