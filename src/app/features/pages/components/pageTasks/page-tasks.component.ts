import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { WorkflowService, PageService } from 'services';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';

import { PageModel } from 'models';
import { PageActions, AlertsActions } from 'state';
import { PAGE_STATUS, FORM_STATE, CONTENT_TYPE, NOTIFICATION_TYPE, NOTIFICATION_MESSAGE } from 'constant';
import * as format from 'string-format';

@Component({
    selector: 'page-tasks',
    templateUrl: 'page-tasks.html'
})
export class PageTasksComponent implements OnInit {

    @ViewChild('warningPopup') public warningPopup: ModalDirective;
    @ViewChild('publishConfirmation') public publishConfirmation: ModalDirective;
    @ViewChild('confirmationCancel') public confirmationCancel: ModalDirective;
    @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
    @ViewChild('confirmSaveAndPublishPopup') public confirmSaveAndPublishPopup: MBCConfirmationComponent;

    @Input() isFormChanged: boolean;
    @Input() pageEntityId: string;

    @Input() isFormValid: boolean;
    @Input() isCreate: boolean;
    @Input() pageStatus: string;

    @Output() statusChanged = new EventEmitter<any>();
    @Output() saveAndPublish = new EventEmitter();
    public message = NOTIFICATION_MESSAGE;

    constructor(private router: Router,
        private pageActions: PageActions,
        private pageService: PageService,
        private workflowService: WorkflowService,
        private alertsActions: AlertsActions) { }

    onBeforeClose() {
        if(this.isFormChanged) {
            this.confirmationCancel.show();
        }else{
            this.router.navigate(['pages']);
        }
    }

    onClose() {
        this.router.navigate(['pages']);
    }

    onCopy() {
        if (this.isFormChanged) {
            this.warningPopup.show();
        } else {
            this.router.navigate(['pages', 'create'], { queryParams: { copyFromId: this.pageEntityId } });
        }
    }

    onPublish() {
        this.pageActions.publishPage(this.pageEntityId)
            .subscribe(x=> {
                this.publishConfirmation.hide();

                let options = {
                    currentStatus: this.pageStatus,
                    targetStatus: PAGE_STATUS.LIVE
                };

                this.workflowService.getStatusInterval((variables) => {
                    this.statusChanged.emit(variables.status);
                    this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                            format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                                            'Published'));
                }, CONTENT_TYPE.PAGE, this.pageEntityId, options);
            });
    }

    ngOnInit() { }

    isShowPublish() {
        return !this.isCreate && this.pageStatus !== PAGE_STATUS.LIVE && this.pageStatus !== PAGE_STATUS.READY;
    }

    /**
     * Show Un-publish button if page status is live
     */
    isShowUnpublishButton(){
        return this.pageStatus === PAGE_STATUS.LIVE || this.pageStatus === PAGE_STATUS.UPDATED;
    }

    /**
     * Show popup confirm to unpublish the page
     */
    confirmUnpublishPage($event) {
        this.confirmUnpublishPopup.show();
    }

     /**
     * Show popup confirm to delete the page
     */
    confirmDelete($event){
        this.confirmDeletePopup.show();
    }

    /**
     * Process Un-publish the page
     */
    onUnpublish() {
        this.workflowService.unpublish(CONTENT_TYPE.PAGE, this.pageEntityId)
            .subscribe(res => {
                this.statusChanged.emit(res.status);
                let options = {
                    currentStatus: PAGE_STATUS.UNPUBLISH,
                    targetStatus: PAGE_STATUS.INACTIVE
                };

                this.workflowService.getStatusInterval((variables) => {
                    this.statusChanged.emit(variables.status);
                    this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                            format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                                            'Un-published'));
                }, CONTENT_TYPE.PAGE, this.pageEntityId, options);
            });
    }

    /**
     * Process Delete the page
     */
    onDelete() {
      this.pageService.deleteRelatives( [ this.pageEntityId ] ).subscribe( delRes => {
        this.workflowService.delete(CONTENT_TYPE.PAGE, this.pageEntityId)
          .subscribe(res => {
            this.statusChanged.emit(res.status);
            let options = {
              currentStatus: this.pageStatus,
              targetStatus: PAGE_STATUS.DELETED
            };

            this.workflowService.getStatusInterval((status) => {
              this.router.navigate([`/pages`]).then(res => {
                this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
              });
            }, CONTENT_TYPE.PAGE, this.pageEntityId, options);
          });
        });
    }

    confirmSaveAndPublish($event) {
      this.confirmSaveAndPublishPopup.show();
    }

    onSaveAndPublish() {
      this.saveAndPublish.emit();
    }

}
