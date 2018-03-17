import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { CampaignService, PageService } from 'services';
import { storageConfigs } from 'configs';
import { Campaign, CampaignResult, SearchCriteria } from 'models';
import { dateFormatter, campaignStatusFormatter } from 'utils/formatters';
import { CampaignActions, AlertsActions } from 'state';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { NOTIFICATION_TYPE, NOTIFICATION_MESSAGE, CAMPAIGN_STATUS } from 'constant';
import { getDateFormat, getDate, CAMPAIGN_DATE_FORMAT } from 'utils/date-helpers';

import * as format from 'string-format';

@Component({
  selector: 'manage-campaign',
  templateUrl: 'manage-campaign.html'
})

export class ManageCampaignComponent {

  @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmCancelPopup') public confirmCancelPopup: MBCConfirmationComponent;
  @ViewChild('confirmPublishNowPopup') public confirmPublishNowPopup: MBCConfirmationComponent;
  @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
  @ViewChild('confirmPublishBulkPopup') public confirmPublishBulkPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishBulkPopup') public confirmUnpublishBulkPopup: MBCConfirmationComponent;
  @ViewChild('confirmCancelBulkPopup') public confirmCancelBulkPopup: MBCConfirmationComponent;
  @ViewChild('confirmDeleteBulkPopup') public confirmDeleteBulkPopup: MBCConfirmationComponent;
  @ViewChild('confirmEndDateInThePast') public confirmEndDateInThePast: MBCConfirmationComponent;

  public loading: boolean = true;
  public pages: Array<Campaign> = [];
  public hasMore: boolean;
  public totalRecords: number;
  public dateFormatter = dateFormatter;
  public campaignStatusFormatter = campaignStatusFormatter;
  public message = NOTIFICATION_MESSAGE;
  public hasSelectedPages: boolean = false;
  public hasPublishPages: boolean = false;
  public hasUnpublishPages: boolean = false;
  public hasCancelPages: boolean = false;

  private searchCriteria = new SearchCriteria();

  public bulkActions = [{
    value: 'publish',
    text: 'Publish',
    isValid: () => this.hasPublishPages
  },{
    value: 'unpublish',
    text: 'Up-publish',
    isValid: () => this.hasUnpublishPages
  },{
    value: 'cancel',
    text: 'Cancel',
    isValid: () => this.hasCancelPages
  },{
    value: 'delete',
    text: 'Delete',
    isValid: () => this.hasSelectedPages
  }];

  public filterFields =[{
    value: 'status',
    text: 'Status'
  }, {
    value: 'startDate',
    text: 'Start Date'
  }, {
    value: 'endDate',
    text: 'End Date'
  }]

  public filterOptions = [];

  constructor(
    private campaignService: CampaignService,
    private pageService: PageService,
    private storage: LocalStorageService,
    private campaignActions: CampaignActions,
    private alertsActions: AlertsActions,
    private router: Router) {
  }

  newSearch($event) {
    this.searchCriteria = $event;
    this.hasMore = true;
    this.pages = [];
    this.searchCampaign();
  }

  searchCampaign() {
    this.loading = true;
      this.campaignService.getCampaigns(this.searchCriteria)
      .subscribe(result => {
        const pageConfigs = this.storage.retrieve(storageConfigs.page);
        this.assignResult(result, pageConfigs)
        this.loading = false;
      });
  }

  assignResult = (result, pageConfigs) => {
    this.pages = this.pages.concat(result);
    this.totalRecords = result.totalItems;
    this.hasMore = result.length === this.searchCriteria.pageSize;
  }

  loadMore($event) {
    if (this.hasMore && !this.loading) {
      this.loading = true;
      this.searchCriteria.page += 1;
      this.searchCampaign();
    }
  }

  sort(field) {
    if (this.searchCriteria.orderBy !== field) {
      this.searchCriteria.orderDir = 'sorting_asc';
    } else {
      this.searchCriteria.orderDir = this.searchCriteria.orderDir === 'sorting_asc' ? 'sorting_desc' : 'sorting_asc';
    }
    this.searchCriteria.orderBy = field;
    this.searchCriteria.page = 0;
    this.pages = [];
    this.searchCampaign();
  }

  getDetailUrl(entry): string {
    return `/campaigns/detail/${entry.id}`;
  }

  editCampaign($event): void {
    this.router.navigate(['campaigns', 'detail', $event.entry.id]);
  }

  /**
   * Copy the campaign to a new one
   */
  copyCampaign($event): void {
    const campaign: Campaign = $event.entry;
    this.router.navigate(['campaigns', 'create']).then(() => {
      campaign.id = null;
      campaign.info.name = 'Copy - ' + campaign.info.name;
      campaign.status = null;
      campaign.result = new CampaignResult({
        type: campaign.result.type,
        mode: campaign.result.mode,
        numberOfResultShow: campaign.result.numberOfResultShow,
        placements: campaign.result.placements,
        placementMode: campaign.result.placementMode,

      });
      this.campaignActions.updateCampaignState(campaign);
    });
  }

  /**
    * Condition to show publish button
    */
  showPublishCondition(row) {
    return row.status === CAMPAIGN_STATUS.DRAFT || row.status === CAMPAIGN_STATUS.INACTIVE;
  }

  /**
   * Condition to show un-publish button
   */
  showUnpublishCondition(row): boolean {
    return row.status === CAMPAIGN_STATUS.LIVE || row.status === CAMPAIGN_STATUS.PARTIALLIVE;
  }

  /**
   * Condition to show publish now button
   */
  showPublishNowCondition(row): boolean {
    return row.status == CAMPAIGN_STATUS.PENDINGLIVE;
  }

  /**
   * Condition to show cancel button
   */
  showCancelCondition(row): boolean {
    return row.status == CAMPAIGN_STATUS.PENDINGLIVE;
  }

  confirmPublish($event) {
    const $campaign = $event.entry;
    $event.event.target.value = '';
    if(!this.validCampaignOnPublish($campaign)){
      this.confirmEndDateInThePast.show();
      return;
    }
    this.confirmPublishPopup.show($campaign);
  }

  confirmUnpublish($event) {
    const $campaign = $event.entry;
    this.confirmUnpublishPopup.show($campaign);
    $event.event.target.value = '';
  }

  confirmPublishNow($event) {
    const $campaign = $event.entry;
    this.confirmPublishNowPopup.show($campaign);
    $event.event.target.value = '';
  }

  confirmDelete($event) {
    const $page = $event.entry;
    this.confirmDeletePopup.show($page);
    $event.event.target.value = '';
  }

  confirmCancel($event) {
    const $campaign = $event.entry;
    this.confirmCancelPopup.show($campaign);
    $event.event.target.value = '';
  }

  pageSelectedChange($event){
    this.hasSelectedPages = this.pages.filter(p => p.checked).length > 0;

    this.hasPublishPages = this.hasSelectedPages
      && this.pages.filter(p => p.checked
      && (p.status == CAMPAIGN_STATUS.DRAFT
      || p.status == CAMPAIGN_STATUS.INACTIVE)).length > 0;

    this.hasUnpublishPages = this.hasSelectedPages
      && this.pages.filter(p => p.checked
      && (p.status === CAMPAIGN_STATUS.ACTIVE
          || p.status === CAMPAIGN_STATUS.LIVE
        || p.status === CAMPAIGN_STATUS.PARTIALLIVE)).length > 0;

    this.hasCancelPages = this.hasSelectedPages
      && this.pages.filter(p => p.checked
      && p.status === CAMPAIGN_STATUS.PENDINGLIVE).length > 0;

  }

  doBulkAction($event) {
    const value = $event.target.value;
    if (value === 'publish') {
      const $pages = this.pages.filter(p => p.checked
        && p.status == CAMPAIGN_STATUS.DRAFT || p.status == CAMPAIGN_STATUS.INACTIVE);

        this.confirmPublishBulkPopup.show($pages);
    } else if (value === 'unpublish') {
      const $pages = this.pages.filter(p => p.checked
        && (p.status === CAMPAIGN_STATUS.ACTIVE || p.status === CAMPAIGN_STATUS.LIVE
          || p.status === CAMPAIGN_STATUS.PARTIALLIVE));

      this.confirmUnpublishBulkPopup.show($pages);
    } if (value === 'cancel') {
      const $pages = this.pages.filter(p => p.checked && p.status == CAMPAIGN_STATUS.PENDINGLIVE);
      this.confirmCancelBulkPopup.show($pages);
    } else if (value === 'delete') {
      const $pages = this.pages.filter(p => p.checked);
      this.confirmDeleteBulkPopup.show($pages);
    }
    $event.target.value = '';
  }

  onPublishBulk($campaigns) {
    const validCampaigns = $campaigns.filter(x=>this.validCampaignOnPublish(x));
    const invalidCampaigns = $campaigns.filter(x=>!this.validCampaignOnPublish(x));

    validCampaigns.forEach(x=>{
        if(x.status == CAMPAIGN_STATUS.PENDINGLIVE){
          x.info.startActiveDateTime = new Date();
        }
        else{
          this.updateStartDateForPublish(x);
        }
     });

    this.campaignService.publishBulk(validCampaigns).subscribe(res => {
      this.updatePageStatus(validCampaigns, res);
      $campaigns.forEach($campaign => {
          $campaign.checked = false;
      });
      this.pageSelectedChange($campaigns);
      if(invalidCampaigns.length > 0){
        this.confirmEndDateInThePast.message = `Some of the selected items are published successfully.
                                                However, the following items were not published
                                                 because the End Date is invalid`;
        this.confirmEndDateInThePast.message += '<ul>';
        invalidCampaigns.forEach(element => {
          this.confirmEndDateInThePast.message +=  format('<li>{}</li>', element.info.name);
        });
        this.confirmEndDateInThePast.message += '</ul>';
        this.confirmEndDateInThePast.show();
        return ;
      }
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
    });
  }

  onUnpublishBulk($campaigns) {
    const bulkIds = $campaigns.map(item => item.id);

    this.campaignService.unpublishBulk(bulkIds).subscribe(res => {
      this.updatePageStatus($campaigns, res);
      this.pageSelectedChange($campaigns);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-Published'));
    });
  }

  onCancelBulk($campaigns) {
    const bulkIds = $campaigns.map(item => item.id);

    this.campaignService.cancelBulk(bulkIds).subscribe(res => {
      this.updatePageStatus($campaigns, res);
      this.pageSelectedChange($campaigns);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Cancelled'));
    });
  }

  onDeleteBulk($campaigns){
    const bulkIds = $campaigns.map(item => item.id);
    this.campaignService.deleteBulk(bulkIds).subscribe(res => {
      $campaigns.forEach(campaign => {
        let index = this.pages.findIndex(item => item.id === campaign.id);
        this.pages.splice(index, 1);
      });
      this.pageSelectedChange($campaigns);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
    });

  }

  private updatePageStatus($campaigns: Array<Campaign>, res: any):void{
    $campaigns.forEach($campaign => {
      var status = res.filter(item => item.id === $campaign.id)
                      .map(p => p.status)[0];
        $campaign.status = status;
        $campaign.checked = false;
    });
  }

  /**
   * Publish a campaing
   */
  onPublish($event): void {
    const campaign: Campaign = $event;
    this.updateStartDateForPublish(campaign);
    this.campaignService.publishAndSaveCampaign(campaign).subscribe(res => {
      campaign.status = res.status;
      campaign.info.startActiveDateTime = res.info.startActiveDateTime;
      campaign.publishedDateTime = res.publishedDateTime;
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
    });
  }

  /**
   * Un-Publish a campaing
   */
  onUnPublish($event): void {
    const campaign: Campaign = $event;
    this.campaignService.unpublishCampaign(campaign.id).subscribe(res => {
      campaign.status = res.data;
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-Published'));
    });
  }

  onCancel($event): void {
    const campaign: Campaign = $event;
    this.campaignService.cancelCampaign(campaign.id).subscribe(res => {
            campaign.status = res.data;
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Cancelled'));
    });
  }

  onPublishNow($event) : void {
    const campaign: Campaign = $event;
    campaign.info.startActiveDateTime = getDateFormat(new Date(), CAMPAIGN_DATE_FORMAT);
    this.campaignService.publishAndSaveCampaign(campaign).subscribe(res => {
        campaign.status = res.status;
        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
      });
    }

     /**
     * Process Delete the page
     */
    onDelete($event) {
      const campaign: Campaign = $event;
      this.campaignService.deleteCampaign(campaign.id).subscribe(res => {
        let index = this.pages.findIndex(item => item.id === campaign.id);
        this.pages.splice(index, 1);
        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
          format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
      });
    }

  createCampaign(): void {
    this.campaignActions.resetCampaignState();
    this.router.navigate(['campaigns', 'create']);
  }

  validCampaignOnPublish(campaign: Campaign){
    if(!campaign.info.endActiveDateTime){
        return true;
    }
    let endDate = getDate(campaign.info.endActiveDateTime, CAMPAIGN_DATE_FORMAT);
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

  changeFilterField($event) {
    const searchValue: string = $event.target.value;
    this.filterOptions = [];

    if (searchValue === 'status') {
      this.filterOptions = [
        { id: 'live', value: 'Live' },
        { id: 'draft', value: 'Draft' },
        { id: 'inactive', value: 'Unpublished' },
        { id: 'pendingLive', value: 'Pending Live' },
        { id: 'partialLive', value: 'Partial Live' }
      ];
    }
  }
}
