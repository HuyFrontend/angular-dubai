
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { select } from '@angular-redux/store';
import { Router } from '@angular/router';

import { NOTIFICATION_TYPE,  NOTIFICATION_MESSAGE, CAMPAIGN_STATUS} from 'constant';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';

import { Campaign, CampaignResult } from 'models';
import { AlertsActions, CampaignActions } from 'state';
import { CampaignService } from 'services';

import { Observable } from 'rxjs/Observable';
import { getDateFormat, CAMPAIGN_DATE_FORMAT } from 'utils/date-helpers';

import * as format from 'string-format';

@Component({
    selector: 'campaign-tasks',
    templateUrl: 'campaign-tasks.html'
})
export class CampaignTasksComponent implements OnInit {
    @ViewChild('confirmCopyPopup') public confirmCopyPopup: MBCConfirmationComponent;
    @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmPublishNowPopup') public confirmPublishNowPopup: MBCConfirmationComponent;
    @ViewChild('confirmCancelPopup') public confirmCancelPopup: MBCConfirmationComponent;
    @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
    @ViewChild('confirmSaveAndPublishPopup') public confirmSaveAndPublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmEndDateInThePast') public confirmEndDateInThePast: MBCConfirmationComponent;
    @ViewChild('confirmClosePopup') public confirmClosePopup: MBCConfirmationComponent;

    @select(['forms', 'campaign']) campaign$: Observable<Campaign>;
    @Input() valid: boolean;
    @Input() dirty: boolean;

    private submitting: boolean = false;
    private sentOneRequest: boolean = false;

    public message = NOTIFICATION_MESSAGE;
    public campaign: Campaign = new Campaign();

    constructor(
        private router: Router,
        private campaignAction: CampaignActions,
        private campaignService: CampaignService,
        private alertsActions: AlertsActions) {
    }

    ngOnInit() {
        this.campaign$.subscribe(c => {
            this.campaign = c;
        });
    }
    /**
     * Check if form is submitting
     */
    isSubmitting(): boolean {
        return this.submitting;
    }

    isEditing(): boolean {
        return this.campaign.id != null;
    }

    /**
     * Condition to show publish button
     */
    showPublishCondition(): boolean {
        return this.campaign.status === CAMPAIGN_STATUS.DRAFT || this.campaign.status === CAMPAIGN_STATUS.INACTIVE;
    }

    /**
     * Condition to show un-publish button
     */
    showUnpublishCondition(): boolean {
        return this.campaign.status === CAMPAIGN_STATUS.LIVE || this.campaign.status === CAMPAIGN_STATUS.PARTIALLIVE;
    }

    /**
     * Condition to show publish now button
     */
    showPublishNowCondition(): boolean {
        return this.campaign.status === CAMPAIGN_STATUS.PENDINGLIVE;
    }

    /**
     * Condition to show cancel button
     */
    showCancelCondition(): boolean {
        return this.showPublishNowCondition();
    }

    /**
     * Copy the current campaign to an other campaign.
     */
    onCopy(): void {
        if (this.dirty) {
            this.confirmCopyPopup.show();
            return;
        }
        const currentCampaign = this.campaign;
        this.router.navigate(['campaigns', 'create']).then(() => {
            currentCampaign.id = null;
            currentCampaign.info.name = 'Copy - ' + currentCampaign.info.name;
            currentCampaign.result = new CampaignResult({
                type: currentCampaign.result.type,
                mode: currentCampaign.result.mode,
                numberOfResultShow: currentCampaign.result.numberOfResultShow,
                placements: currentCampaign.result.placements,
                placementMode: currentCampaign.result.placementMode
            });
            currentCampaign.status = null;
            currentCampaign.publishedDateTime = null;
            this.campaignAction.updateCampaignState(currentCampaign);
        });
    }

    confirmSaveAndPublish($event){
        if(!this.checkValidCampaignOnPublish()){
            this.confirmEndDateInThePast.show();
            return;
        }
        this.confirmSaveAndPublishPopup.show();
    }

    onSaveAndPublish(){
        this.onSave(true);
    }

    onSave(isSaveAndPublish = false): void {
      this.submitting = true;
      if (!this.valid) {
        return;
      }
      this.filterPlacementData();
      if (!this.sentOneRequest) {
        this.sentOneRequest = true;
        if (isSaveAndPublish) {
          this.updateStartDateForPublish(this.campaign);
          this.campaignService.publishAndSaveCampaign(this.campaign).subscribe(res => {
            const { id } = res;
            if (id) {
              this.sentOneRequest = false;
              this.campaign.status = res.status;
              this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
              this.router.navigate([`/campaigns/detail/${id}`]);
            }
          });
        } else {
          this.campaignService.saveOrUpdateCampaign(this.campaign).subscribe(res => {
            const { id } = res;
            if (id) {
              this.router.navigate([`/campaigns/detail/${id}`]);
            }
            this.dirty = false;
            this.sentOneRequest = false;
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Saved'));
          });
        }
      }
      this.submitting = false;
    }

    onPublishNow() : void {
        this.campaign.info.startActiveDateTime = getDateFormat(new Date(), CAMPAIGN_DATE_FORMAT);
        this.campaignService.publishAndSaveCampaign(this.campaign).subscribe(res => {
            this.campaign.status = res.status;
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
        });
    }

    confirmPublish():void{
        if(!this.checkValidCampaignOnPublish()){
            this.confirmEndDateInThePast.show();
            return;
        }
        this.confirmPublishPopup.show();
    }

    confirmPublishNow():void{
        if(!this.checkValidCampaignOnPublish()){
            this.confirmEndDateInThePast.show();
            return;
        }
        this.confirmPublishNowPopup.show();
    }

    confirmUnPublish():void{
        this.confirmUnpublishPopup.show();
    }

    confirmCacel(): void{
        this.confirmCancelPopup.show();
    }

    /**
     * Show popup confirm to delete the page
     */
    confirmDelete($event){
      this.confirmDeletePopup.show();
    }

    /**
     * Publish a campaign
     */
    onPublish(isSaveAndPublish = false): void {
        this.updateStartDateForPublish(this.campaign);
        this.campaignService.publishAndSaveCampaign(this.campaign).subscribe(res => {
            this.campaign.status = res.status;
            this.campaign.info.startActiveDateTime = res.info.startActiveDateTime;
            this.campaign.publishedDateTime = res.publishedDateTime;
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
            if(isSaveAndPublish){
                this.router.navigate([`/campaigns/detail/${this.campaign.id}`]);
            }
        });
    }

    /**
     * Un-Publish a campaign
     */
    onUnPublish(): void {
        this.campaignService.unpublishCampaign(this.campaign.id).subscribe(res => {
            this.campaign.status = res.data;
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-Published'));
        });
    }

    onCancel(): void {
        this.campaignService.cancelCampaign(this.campaign.id).subscribe(res => {
            this.campaign.status = res.data;
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Cancelled'));
        });
    }

    /**
     * Process Delete the page
     */
    onDelete() {
      this.campaignService.deleteCampaign(this.campaign.id).subscribe(res => {
        this.router.navigate([`/campaigns`]);
        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
          format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
      });
    }

    filterPlacementData() {
        let placements = this.campaign.result.placements;
        if (placements && placements.length > 0) {
            this.campaign.result.placements = placements.filter(x => x.destination || x.placementOrder!=0);
        }
    }

    /**
     * Back to campaign list
     */
    confirmClose(): void {
      if (this.dirty) {
        this.confirmClosePopup.show();
      }
      else{
        this.onClose();
      }
    }

    onClose() {
      this.router.navigate([`/campaigns`]);
    }

    checkValidCampaignOnPublish(){
        if(!this.campaign.info.endActiveDateTime){
            return true;
        }
        let endDate = new Date(this.campaign.info.endActiveDateTime);
        return endDate >= new Date();
    }

    updateStartDateForPublish(campaign: Campaign){
        const currentDateTime = new Date();
        if(campaign.info.startActiveDateTime){
          let startDate = new Date(campaign.info.startActiveDateTime);
          if(startDate < currentDateTime){
              campaign.info.startActiveDateTime = getDateFormat(currentDateTime, CAMPAIGN_DATE_FORMAT);
          }
        }
      }
}
