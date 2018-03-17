import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { select } from '@angular-redux/store';
import { NgForm } from '@angular/forms';
import { App, CommentModel, PageSuggestionRequest } from 'models';
import { AppActions } from 'state';
import { CONTENT_TYPE, APP_STATUS } from 'constant';
import { getInterestSuggestions, getAllInterestNode } from 'utils/config-helper';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { PageService, AppConfigService, WorkflowService } from 'services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { dateFormatter } from 'utils';

@Component({
  selector: 'app-tab-info',
  styleUrls: ['app-tab-info.scss'],
  templateUrl: 'app-tab-info.html',
})

export class AppTabInfoComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('infoForm') form: NgForm;
  @select(['forms', 'app']) app$: Observable<App>;

  public app: App = new App();
  public originalName: string = '';
  public listPageSelected = [];
  public listInterestsSelected = [];
  public interestList: any[] = [];
  public appPublishOnBehalf: any = null;
  public listOfComments: Array<CommentModel> = [];
  public dateFormatter = dateFormatter;
  public appTypes = [
    { value: '', text: 'Select' },
    { value: 'MobileApp', text: 'Mobile App' },
    { value: 'Trivia', text: 'Trivia' },
    { value: 'Game', text: 'Game' },
    { value: 'Competition', text: 'Competition' },
    { value: 'Casting', text: 'Casting' },
    { value: 'Voting', text: 'Voting' }
  ];
  public isFormSubmitted: boolean = false;
  public isReadOnly: boolean;
  public isReadOnlyPublicOnBehalf: boolean;
  public entityType: string ='';

  private appSubscription: Subscription;
  public appStatus = APP_STATUS;

  constructor(
    private appAction: AppActions,
    private pageService: PageService,
    private configServive: AppConfigService,
    private workflowService: WorkflowService
  ) {
    this.isReadOnly = false;
    this.isReadOnlyPublicOnBehalf = false;
  }

  ngOnInit() {
    this.appSubscription = this.app$.subscribe(appData => {
      if (appData) {
        this.app = appData;
        this.initMultipleSuggestionValue();
        this.listPageSelected = this.app.info.tagToPages;

        const appStatus = this.app.info && this.app.info.status;
        this.checkReadOnly(appStatus);

        this.entityType = 'app';
        if (!this.originalName) {
          this.originalName = this.app.info.title;
        }

        this.appPublishOnBehalf = {
          pageId: this.app.info.publishOnBehalf.entityId,
          pageName: this.app.info.publishOnBehalf.displayName
        };
        this.getListOfComments();
      }
    });

    this.configServive.fetchInterestConfigs().subscribe(interestData => {
      this.interestList = getAllInterestNode(interestData);
    });
  }
  ngAfterViewInit() {
    this.form.valueChanges.subscribe(values => this.appAction.updateState(values));
  }

  ngOnDestroy() {
    this.form.resetForm();
    this.appSubscription.unsubscribe();
  }

  isValid(isSubmitting): boolean {
    this.isFormSubmitted = isSubmitting;
    if (isSubmitting) {
      this.form.form.controls['title'].markAsDirty();
      this.form.form.controls['type'].markAsDirty();
    }
    return !this.form.invalid;
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  onQueryPage({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    this.pageService
      .suggest(new PageSuggestionRequest('publishOnBehalf', val, '', ''))
      .subscribe(listPage => {
        _updateEvent.next(listPage.map((p) => ({ pageId: p.entityId, pageName: p.internalUniquePageName })));
      });
  }

  onQueryTagPage({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    let publishOnBehalfIds = [];
    if (this.app.info.publishOnBehalf && this.app.info.publishOnBehalf.entityId) {
      publishOnBehalfIds.push(this.app.info.publishOnBehalf.entityId);
    }

    this.pageService
      .suggest(new PageSuggestionRequest('tag', val, '', '', publishOnBehalfIds))
      .subscribe(listPage => {
        _updateEvent.next(this.convertToContentRelationship(listPage, 'internalUniquePageName'));
      });
  }

  convertToContentRelationship(listItem: any[], key) {
    const display = 'displayName';
    listItem.map((item, idx, ar) => {
      item[display] = item[key];
      return item;
    });
    return listItem;
  }

  onPageChanged(data: any) {
    this.app.info.publishOnBehalf.entityId = data ? data.pageId : null;
    this.app.info.publishOnBehalf.displayName = data ? data.pageName : null;
    this.appAction.updateState(this.app);
  }

  onAddedPage(obj: any) {
    if (obj) {
      this.listPageSelected.push(obj);
    }

    this.app.info.tagToPages = this.listPageSelected;
    this.appAction.updateState(this.app);
  }

  onRemovePage(page: any) {
    if (page) {
      this.listPageSelected = this.listPageSelected.filter(x => x.entityId != page.entityId);
    }

    this.app.info.tagToPages = this.listPageSelected;
    this.appAction.updateState(this.app);
  }

  onQueryInterest({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    this.configServive.fetchInterestConfigs().subscribe(x => {
      const results = getInterestSuggestions(val, x, this.listInterestsSelected);
      _updateEvent.next(this.convertToContentRelationship(results, 'id'));
    });
  }

  onInterestSelectedChanged(listSelected: any) {
    this.listInterestsSelected = listSelected;
  }

  onAddedInterest(interest: any) {
    if (interest) {
      if (!this.app.info.interests) {
        this.app.info.interests = [];
      }
      this.app.info.interests.push(interest.id);
      this.appAction.updateState(this.app);
    }
  }

  onRemoveInterest(interest: any) {
    if (interest) {
      if (this.app.info.interests) {
        this.app.info.interests = this.app.info.interests.filter(id => id !== interest.id);
        this.appAction.updateState(this.app);
        this.listInterestsSelected = this.listInterestsSelected.filter(item => item.id !== interest.id);
      }
    }
  }

  initMultipleSuggestionValue() {
    const arrInterestSelected: any[] = this.interestList.filter(item => this.app.info.interests.find(code => item.code === code));
    this.listInterestsSelected = this.formatSuggestionList(arrInterestSelected);
  }

  formatSuggestionList(arrData: any[]) {
    return arrData.map(item => {
      const value = item.names ? item.names[0].text : '';
      const objData = {
        id: item.code,
        value,
        raw: item
      };
      return objData;
    });
  }

  getListOfComments(){
    if(!this.app || !this.app.info || !this.app.info.id){
      return ;
    }
    this.workflowService.getListOfRejectComments(this.app.info.id, CONTENT_TYPE.APP).subscribe(result => {
      this.listOfComments = result;
    });
  }
  /**
   * check status of app and set readonly for form fields
   */
  checkReadOnly(appStatus: string) {
    if (appStatus) {
      this.isReadOnly = appStatus === this.appStatus.PENDING;
      this.isReadOnlyPublicOnBehalf = (appStatus === this.appStatus.PENDING) || (appStatus === this.appStatus.INACTIVE) ||  (appStatus === this.appStatus.UPDATED) || (appStatus === this.appStatus.LIVE);
    }
  }
}
