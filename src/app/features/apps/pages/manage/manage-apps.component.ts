import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { storageConfigs } from 'configs';
import { dateFormatter } from 'utils/formatters';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as format from 'string-format';
import { App } from "models/app.model";
import { AppInfo, AppOptions } from "models/app";
import { EntityStatus } from "models/entity.model";
import { PageService, AppConfigService, WorkflowService, ContentService } from "services";
import { AppService } from "services/app.services";
import { AppActions, AlertsActions } from "state";
import { Content, ContentRelationship, SearchCriteria, PageSuggestionRequest } from 'models';
import { getInterestSuggestions, getAllInterestNode } from 'utils/config-helper';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { CONTENT_TYPE, PUBLISHING_LEVEL, NOTIFICATION_TYPE, NOTIFICATION_MESSAGE, CONTENT_STATUS, MODERATE_ACTION, WORKFLOW_TASK } from 'constant';

@Component({
  selector: 'manage-apps',
  templateUrl: 'manage-apps.html'
})

export class ManageAppsComponent implements OnInit {
  @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
  @ViewChild('confirmModeratePopup') public confirmModeratePopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishBulkPopup') public confirmUnpublishBulkPopup: MBCConfirmationComponent;
  @ViewChild('confirmDeleteBulkPopup') public confirmDeleteBulkPopup: MBCConfirmationComponent;

  public loading: boolean = true;
  public apps: Array<App> = [];
  public hasMore: boolean;
  public dateFormatter = dateFormatter;
  public filterOptions: any[];
  public isRemoteSuggestion: boolean = false;

  private pageSize: number = 20;
  private searchCriteria: any = {};
  private search: SearchCriteria = new SearchCriteria();
  public message = NOTIFICATION_MESSAGE;

  public searchFields = new Map([
    ['title', 'data.title'],
    ['type', 'data.type'],
    ['displayName', 'publish.data.internalUniquePageName'],
    ['createdDateTime', 'createdAt'],
    ['publishedDateTime', 'publishedDate'],
    ['status', 'status'],
    ['description', 'data.description']
  ]);

  public bulkActions = [{
    value: 'publish',
    text: 'Publish',
    isValid: () => this.getAppsForPublish().length > 0
  }, {
    value: 'approve',
    text: 'Approve',
    isValid: () => this.getAppsForModerate().length > 0
  }, {
    value: 'reject',
    text: 'Reject',
    isValid: () => this.getAppsForModerate().length > 0
  }, {
    value: 'unpublish',
    text: 'Up-publish',
    isValid: () => this.getAppsForUnPublish().length > 0
  }, {
    value: 'delete',
    text: 'Delete',
    isValid: () => this.getAppsForDelete().length > 0
  }];

  constructor(
    private appsService: AppService,
    private workflowService: WorkflowService,
    private contentService: ContentService,
    private appsAction: AppActions,
    private storage: LocalStorageService,
    private router: Router,
    private pageServices: PageService,
    private alertsActions: AlertsActions,
    private config: AppConfigService

  ) {
  }

  ngOnInit() {
  }

  newSearch($event) {
    this.searchCriteria = $event;
    this.apps = [];
    this.hasMore = true;
    this.searchApps();
  }

  searchApps() {
    this.loading = true;
    this.appsService.getApps(this.searchCriteria.field,
      this.searchCriteria.keywords.join(),
      this.searchCriteria.quickSearchValue,
      this.searchCriteria.fromDate,
      this.searchCriteria.toDate,
      this.searchCriteria.orderBy,
      this.searchCriteria.orderDir,
      this.searchCriteria.page,
      this.pageSize)
      .subscribe(result => {
        const apps = result.content;
        apps.forEach((appEntity) => {
          this.apps.push(this.convertFromSearchedEntity(appEntity));
        });
        this.hasMore = result.content.length === this.searchCriteria.pageSize;
        this.loading = false;
      });
  }

  loadMore($event) {
    if (this.hasMore && !this.loading) {
      this.loading = true;
      this.searchCriteria.page += 1;
      this.searchApps();
    }
  }

  sort(field) {
    let fieldParts = field.split('.');
    field = this.searchFields.get(fieldParts[fieldParts.length - 1]);
    if (this.searchCriteria.orderBy !== field) {
      this.searchCriteria.orderDir = 'sorting_asc';
    } else {
      this.searchCriteria.orderDir = this.searchCriteria.orderDir === 'sorting_asc' ? 'sorting_desc' : 'sorting_asc';
    }
    this.searchCriteria.orderBy = field;
    this.searchCriteria.page = 0;
    this.apps = [];
    this.searchApps();
  }

  getDetailUrl(entry): string {
    return `/apps/detail/${entry.info.id}`;
  }

  createApp(): void {
    this.appsAction.resetAppState();
    this.router.navigate(['apps', 'create']);
  }

  convertFromSearchedEntity(entity: any): App {
    let tempAppInfo = new AppInfo();
    tempAppInfo.id = entity.entityId;
    tempAppInfo.status = entity.status;
    tempAppInfo.publishedDateTime = entity.publishedDate;
    tempAppInfo.createdDateTime = entity.createdDate;
    tempAppInfo.title = entity.data.title;
    tempAppInfo.interests = entity.data.interests;
    tempAppInfo.tagToPages = entity.data.tagToPages;
    tempAppInfo.type = entity.data.type;
    tempAppInfo.description = entity.data.description;

    if (entity.data.relationships != null && entity.data.relationships.publishOnBehalf && entity.data.relationships.publishOnBehalf[0] != null) {
      tempAppInfo.publishOnBehalf = new ContentRelationship("",
        entity.data.relationships.publishOnBehalf[0].id,
        entity.data.relationships.publishOnBehalf[0]['data.info.internalUniquePageName']);
    } else
      tempAppInfo.publishOnBehalf = new ContentRelationship("", "", "");

    let tempAppOptions = new AppOptions();
    tempAppOptions.code = entity.data.code;
    tempAppOptions.link = entity.data.link;

    let tempApp = new App();
    tempApp.info = tempAppInfo;
    tempApp.generalType = entity.type;
    tempApp.options = tempAppOptions;
    tempApp.photo = entity.data.photo;

    return tempApp;
  }

  editApp($event): void {
    const id = $event.entry.info.id;
    this.router.navigate([`/apps/detail/${id}`]);
  }

  copyApp($event): void {
    const defaultLevel = 4;
    this.contentService.fetchContent($event.entry.info.id, defaultLevel).subscribe(result => {
      this.router.navigate(['apps', 'create']).then(() => {
        let app = this.appsAction.convertEntityToView(result);
        app.info.id = null;
        app.info.title = 'Copy - ' + app.info.title;
        app.info.status = null;
        this.appsAction.updateAppState(app);
      });
    });
  }

  public filterFields = [
    { value: 'status', text: 'Status' },
    { value: 'publish.data.info.internalUniquePageName', text: 'Page' },
    { value: 'data.type', text: 'Type' },
    { value: 'data.interests', text: 'Interest' }
  ];
  changeFilterField($event) {
    const searchValue: string = $event.target.value;

    this.filterOptions = [];
    this.isRemoteSuggestion = false;

    switch (searchValue) {
      case 'status':
        this.filterOptions = [
          { id: 'live', value: 'Live' },
          { id: 'updated', value: 'Updated' },
          { id: 'draft', value: 'Draft' },
          { id: 'inactive', value: 'Unpublished' },
          { id: 'rejected', value: 'Rejected' },
          { id: 'pending', value: 'Pending Approval' },
        ];
        break;
      case 'data.type':
        this.filterOptions = [
          { id: 'MobileApp', value: 'Mobile App' },
          { id: 'Voting', value: 'Voting' },
          { id: 'Trivia', value: 'Trivia' },
          { id: 'Game', value: 'Game' },
          { id: 'Competition', value: 'Competition' },
          { id: 'Casting', value: 'Casting' }
        ];
        break;
      case 'publish.data.info.internalUniquePageName':
      case 'data.interests':
        this.isRemoteSuggestion = true;
        break;
    }
  }
  remoteSuggest({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    if (this.searchCriteria.field === 'publish.data.info.internalUniquePageName') {
      this.pageServices
          .suggest(new PageSuggestionRequest('publishOnBehalf', val))
          .subscribe(listPage => {
            this.filterOptions = listPage.map((p) => {
              return {id: p.internalUniquePageName, value: p.internalUniquePageName}
            })
            _updateEvent.next(this.filterOptions);
          });
    } else if (this.searchCriteria.field === 'tag.internalUniquePageName') {
      this.pageServices
          .suggest(new PageSuggestionRequest('tag', val))
          .subscribe(listPage => {
            this.filterOptions = listPage.map((p) => {
              return {id: p.internalUniquePageName, value: p.internalUniquePageName}
            })
            _updateEvent.next(this.filterOptions);
          });
    } else if (this.searchCriteria.field === 'data.interests') {
      this.config.fetchInterestConfigs().subscribe(x => {
        this.filterOptions = getInterestSuggestions(val, x);
        _updateEvent.next(this.filterOptions);
      });
    }
  }

  onPublished($event) {
    this.confirmPublishPopup.show($event);
    $event.event.target.value = '';
  }

  publishContent($event) {
    if ($event.isBulk) {
      this.publishBulkContent();
      return;
    }
    const app = $event.entry;
    this.workflowService.publish(CONTENT_TYPE.APP, app.info.id, PUBLISHING_LEVEL.LEVEL4)
      .subscribe(res => {
        let options = {
          currentStatus: res.status,
          targetStatus: CONTENT_STATUS.PENDING
        };
        this.workflowService.getStatusInterval((variables) => {
          app.info.status = variables.status;
          app.info.publishedDateTime = variables.publishDate;
          this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
        }, CONTENT_TYPE.APP, app.info.id, options);
      });
  }

  publishBulkContent() {
    let contentForPublish = this.getAppsForPublish()
      .map(app => ({
        entityId: app.info.id,
        entityType: CONTENT_TYPE.APP
      }));
    this.workflowService.publishBulk(contentForPublish).subscribe(result => {
      this.clearChecked();
      this.updateAppsStatus(this.apps, result);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
    });

    this.workflowService.getBulkStatusInterval(result => {
      this.updateAppsStatus(this.apps, result);
    }, contentForPublish, { targetStatus: CONTENT_STATUS.PENDING });
  }

  canShowPublishing(row) {
    return row.info.status != CONTENT_STATUS.LIVE &&
      row.info.status != CONTENT_STATUS.READY &&
      row.info.status != CONTENT_STATUS.PENDING;
  }

  onUnPublished($event) {
    this.confirmUnpublishPopup.show($event);
    $event.event.target.value = '';
  }

  unPublishContent($event) {
    const app = $event.entry;
    this.workflowService.unpublish(CONTENT_TYPE.APP, app.info.id)
      .subscribe(res => {
        let options = {
          currentStatus: res.status,
          targetStatus: CONTENT_STATUS.PENDING
        };
        this.workflowService.getStatusInterval((variables) => {
          app.info.status = variables.status;
          this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'un-Published'));
        }, CONTENT_TYPE.APP, app.info.id, options);
      });
  }

  isShowUnpublishButton(row) {
    return row.info.status === CONTENT_STATUS.LIVE ||
      row.info.status === CONTENT_STATUS.UPDATED
  }

  onDelete($event) {
    this.confirmDeletePopup.show($event);
    $event.event.target.value = '';
  }

  deleteContent($event) {
    const app = $event.entry
    this.workflowService.delete(CONTENT_TYPE.APP, app.info.id)
      .subscribe(res => {
        let index = this.apps.findIndex(item => item.info.id === app.info.id);
        this.apps.splice(index, 1);
        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
      });
  }

  onBulkDelete($items) {
    const bulkReq = $items.map(content => ({
      entityId: content.info.id,
      entityType: CONTENT_TYPE.APP
    }));

    this.workflowService.deleteBulk(bulkReq).subscribe(result => {
      $items.forEach(content => {
        let index = this.apps.findIndex(item => item.info.id === content.info.id);
        this.apps.splice(index, 1);
      });

      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
    });
  }

  canShowApproveOrReject(row) {
    return row.info.status === CONTENT_STATUS.PENDING;
  }

  onModerate($event, moderateAction: string) {
    let message = '';
    if (moderateAction == 'approve') {
      message = 'Approval results in pushing content to front office sites. Do you want to proceed?';
    }
    if (moderateAction == 'reject') {
      message = 'Rejection sends the content back to content publisher. Do you want to proceed?';
    }
    this.confirmModeratePopup.message = message;
    this.confirmModeratePopup.displayComment = (moderateAction == 'reject');
    this.confirmModeratePopup.show({ 'moderateAction': moderateAction, 'originalEvent': $event });
    $event.event.target.value = '';
  }

  moderateContent($event) {
    if ($event.isBulk) {
      this.moderateBulkContent({ action: $event.action, comment: $event.comment });
      return;
    }
    const app = $event.originalEvent.entry;
    this.workflowService.executeWorkflow(CONTENT_TYPE.APP, app.info.id, 'moderateEntity',
      {
        'moderateAction': $event.moderateAction,
        'comment': $event.comment
      })
      .subscribe(res => {
        let options = {
          currentStatus: res.status,
          targetStatus: CONTENT_STATUS.PENDING
        };
        this.workflowService.getStatusInterval((variables) => {
          app.info.status = variables.status;
          app.info.publishedDateTime = variables.publishDate;
          let isReject: boolean = $event.moderateAction == 'reject';
          this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
            (isReject ? 'Rejected' : 'Approved')));
        }, CONTENT_TYPE.APP, app.info.id, options);

      });
  }

  moderateBulkContent($event) {
    let contentForPublish = this.getAppsForModerate().map(app => ({
      entityId: app.info.id,
      entityType: CONTENT_TYPE.APP
    }));
    this.workflowService.executeWorkflows(contentForPublish,
      'moderateEntity', {
        'moderateAction': $event.action,
        'comment': $event.comment
      })
      .subscribe(result => {
        this.clearChecked();
        this.updateAppsStatus(this.apps, result);

        if(MODERATE_ACTION.APPROVE == $event.action){
          let options = {
            currentStatus: [CONTENT_STATUS.PENDING, CONTENT_STATUS.READY],
            targetStatus: CONTENT_STATUS.LIVE
          };

          this.workflowService.getBulkVariablesInterval((result) => {
            this.apps.forEach($page => {
              var variables = result.filter(p => p.entityIdentifier.entityId === $page.info.id)
                .map(p => p.variables)[0];
              if (variables) {
                $page.info.status = variables.status;
                $page.info.publishedDateTime = variables.publishDate;
              }
            });

          }, contentForPublish, options);
        }

        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
          format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
            'Published'));
      });
  }

  unpublishBulkContents($items) {
    const unpublishBulkReq = $items.map(content => ({
      entityId: content.info.id,
      entityType: CONTENT_TYPE.APP
    }));

    this.workflowService.unpublishBulk(unpublishBulkReq).subscribe(result => {
      this.updateAppsStatus($items, result);
    });
    this.clearChecked();
    let options = {
      currentStatus: CONTENT_STATUS.UNPUBLISH,
      targetStatus: CONTENT_STATUS.INACTIVE
    };
    this.workflowService.getBulkStatusInterval((result) => {
      this.updateAppsStatus($items, result);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-published'));
    }, unpublishBulkReq, options);
  }

  updateAppsStatus(apps, newApps) {
    apps.forEach(app => {
      const appsStatus = newApps.filter(p => p.entityIdentifier.entityId === app.info.id)
        .map(p => p.status);
      if (appsStatus.length > 0) {
        app.info.status = appsStatus[0];
      }
    });
  }

  doBulkAction($event) {
    const value = $event.target.value;
    if (value === 'publish') {
      const apps = this.getAppsForPublish();
      if (apps.length > 0) {
        this.confirmPublishPopup.show({ isBulk: true });
      }
    } else if (value === 'unpublish') {
      const $items = this.getAppsForUnPublish();
      this.confirmUnpublishBulkPopup.show($items);
    } else if (value === 'delete') {
      const $items = this.getAppsForDelete();
      this.confirmDeleteBulkPopup.show($items);
    } else if (value === 'approve' || value === 'reject') {
      this.confirmModeratePopup.message = this.moderateActionMessage(value);
      this.confirmModeratePopup.displayComment = (value == 'reject');
      this.confirmModeratePopup.show({ action: value, isBulk: true });
    }
    $event.target.value = '';
  }

  moderateActionMessage(moderateAction) {
    let message = '';
    if (moderateAction == 'approve') {
      message = 'Approval results in pushing content to front office sites. Do you want to proceed?';
    }
    if (moderateAction == 'reject') {
      message = 'Rejection sends the content back to content publisher. Do you want to proceed?';
    }
    return message;
  }

  getAppsForDelete() {
    return this.apps.filter(p => p.checked);
  }

  getAppsForUnPublish() {
    return this.apps.filter(p => p.checked &&
      (p.info.status === CONTENT_STATUS.LIVE || p.info.status === CONTENT_STATUS.UPDATED));
  }

  getAppsForPublish() {
    return this.apps.filter((p) => p.checked && p.info.status !== CONTENT_STATUS.LIVE &&
      p.info.status !== CONTENT_STATUS.READY &&
      p.info.status !== CONTENT_STATUS.PENDING);
  }

  getAppsForModerate() {
    return this.apps.filter((p) => p.checked && p.info.status == CONTENT_STATUS.PENDING);
  }

  clearChecked() {
    this.apps.forEach(x => x.checked = false);
  }
}
