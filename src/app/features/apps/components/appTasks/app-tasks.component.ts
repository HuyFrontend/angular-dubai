import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { select } from '@angular-redux/store';
import { Router } from '@angular/router';

import { NOTIFICATION_TYPE, NOTIFICATION_MESSAGE, CAMPAIGN_STATUS, PUBLISHING_LEVEL, CONTENT_TYPE, CONTENT_STATUS, APP_STATUS } from 'constant';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';

import { Campaign, CampaignResult } from 'models';
import { AlertsActions } from 'state';
import { CampaignService, ContentService, WorkflowService } from 'services';

import { Observable } from 'rxjs/Observable';
import { getDateFormat } from 'utils/date-helpers';

import * as format from 'string-format';
import { App } from "models/app.model";
import { AppActions } from 'state/apps.state';
import { AppService } from 'services/app.services';

@Component({
  selector: 'app-tasks',
  templateUrl: 'app-tasks.html'
})
export class AppTasksComponent implements OnInit {
  @ViewChild('confirmCopyPopup') public confirmCopyPopup: MBCConfirmationComponent;
  @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
  @ViewChild('confirmModeratePopup') public confirmModeratePopup: MBCConfirmationComponent;
  @ViewChild('confirmSaveAndPublishPopup') public confirmSaveAndPublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmClosePopup') public confirmClosePopup: MBCConfirmationComponent;
  @select(['forms', 'app']) app$: Observable<App>;
  @Input() valid: boolean;
  @Input() dirty: boolean;

  private submitting: boolean = false;
  private sentOneRequest: boolean = false;
  public contentStatus: any = CONTENT_STATUS;

  public message = NOTIFICATION_MESSAGE;
  public app: App = new App();
  public appStatus = APP_STATUS;
  constructor(
    private router: Router,
    private appAction: AppActions,
    private contentService: ContentService,
    private workflowService: WorkflowService,
    private alertsActions: AlertsActions) {
  }

  ngOnInit() {
    this.app$.subscribe(appData => {
      this.app = appData;
    });
  }

  isEditing(): boolean {
    return this.app != null && this.app.info != null && this.app.info.id != null;
  }

  onSave(isSaveAndPublish = false): void {
    this.submitting = true;
    if (!this.valid)
      return
      if (!this.sentOneRequest) {
        this.sentOneRequest = true;
        this.contentService.createOrUpdateApp(App.convertToEntity(this.app)).subscribe(res => {
          const id = res.entityId;
          if(id){
            this.app.info.id = id;
          }
          if(isSaveAndPublish){
            this.publishContent(true);
            return;
          }
          if(id) {
            this.dirty = false;
            this.router.navigate([`/apps/detail/${id}`]);
          }
          else {
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Saved'));
          }
          this.sentOneRequest = false;
      }, error => this.sentOneRequest = false);
  }
    this.submitting = false;
  }

  onCopy(): void {
    const oldApp = this.app;
    this.router.navigate(['apps', 'create']).then(() => {
      this.app = oldApp;
      this.app.info.id = null;
      this.app.info.title = 'Copy - ' + oldApp.info.title;
      this.app.info.status = null;
      this.appAction.updateAppState(this.app);
    });
  }

  onClose(): void {
    this.router.navigate([`/apps`]);
  }

  onPublished() {
    this.confirmPublishPopup.show();
  }

  publishContent(isSaveAndPublish = false) {
    this.workflowService.publish(CONTENT_TYPE.APP, this.app.info.id, PUBLISHING_LEVEL.LEVEL4)
      .subscribe(res => {
        let options = {
          currentStatus: res.status,
          targetStatus: CONTENT_STATUS.PENDING
        };
        this.workflowService.getStatusInterval((variables) => {
          this.app.info.status = variables.status;
          this.appAction.updateState(this.app);
          this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
          if(isSaveAndPublish){
            this.router.navigate([`/apps/detail/${this.app.info.id}`]);
          }
        }, CONTENT_TYPE.APP, this.app.info.id, options);
      });
  }

  showPublishCondition(): boolean {
    const status = this.app && this.app.info && this.app.info.status;
    return status === CONTENT_STATUS.DRAFT
      || status === CONTENT_STATUS.INACTIVE
      || status === CONTENT_STATUS.REJECTED;
  }

  showSavePublishCondition(): boolean {
    return !this.app || !this.app.info || !this.app.info.status;
  }

  onSaveAndPublish() {
    this.onSave(true);
  }

confirmSaveAndPublish($event){
  this.confirmSaveAndPublishPopup.show();
}

  onUnPublished() {
    this.confirmUnpublishPopup.show();
  }

  unPublishContent() {
    this.workflowService.unpublish(CONTENT_TYPE.APP, this.app.info.id)
      .subscribe(res => {
        let options = {
          currentStatus: res.status,
          targetStatus: CONTENT_STATUS.PENDING
        };
        this.workflowService.getStatusInterval((variables) => {
          this.app.info.status = variables.status;
          this.appAction.updateState(this.app);
          this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'un-Published'));
        }, CONTENT_TYPE.APP, this.app.info.id, options);
      });
  }

  isShowUnpublishButton() {
    return this.isEditing() &&
      (this.app.info.status === CONTENT_STATUS.LIVE ||
        this.app.info.status === CONTENT_STATUS.UPDATED)
  }

  onDelete() {
    this.confirmDeletePopup.show();
  }

  deleteContent() {
    if (!this.app.info.id) {
      return
    }
    this.workflowService.delete(CONTENT_TYPE.APP, this.app.info.id)
      .subscribe(res => {
        this.app.info.status = res.status;
        this.appAction.updateState(this.app);
        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
        this.router.navigate(['apps']);
      });
  }

  onModerate(moderateAction: string) {
    let message = '';
    if (moderateAction == 'approve') {
      message = 'Approval results in pushing content to front office sites. Do you want to proceed?';
    }
    if (moderateAction == 'reject') {
      message = 'Rejection sends the content back to content publisher. Do you want to proceed?';
    }
    this.confirmModeratePopup.message = message;
    this.confirmModeratePopup.displayComment = (moderateAction == 'reject');
    this.confirmModeratePopup.show({ 'moderateAction': moderateAction });

  }

  moderateContent($event: any) {
    this.workflowService.executeWorkflow(CONTENT_TYPE.APP, this.app.info.id, 'moderateEntity',
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
          this.app.info.status = variables.status;
          this.appAction.updateState(this.app);
          let isReject: boolean = $event.moderateAction == 'reject';
          this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
            (isReject ? 'Rejected' : 'Approved')));
        }, CONTENT_TYPE.APP, this.app.info.id, options);

      });
  }
  isSubmitting() {
    return this.submitting;
  }

  confirmClose(): void {
      if (this.dirty) {
        this.confirmClosePopup.show();
      }
      else{
        this.onClose();
      }
    }
}
