import { Component, ViewChild, AfterViewInit, OnInit, OnChanges, SimpleChanges,OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CampaignTabInfoComponent } from '../../components/infoTab';
import { CampaignTasksComponent } from '../../components/campaignTasks';
import { TabHeaderComponent } from '../../../../components/tabHeader';
import { CampaignTabResultComponent } from '../../components/resultTab';
import { CampaignTabTargetAudienceComponent } from '../../components/targetAudienceTab';

import { CampaignActions } from 'state';
import { Campaign } from 'models';

import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'campaign-detail',
  templateUrl: 'campaign-detail.html',
  styleUrls: ['campaign-detail.scss']
})

export class CampaignDetailComponent implements OnInit, OnChanges,OnDestroy {

  @ViewChild('campaignTasks') campaignTasks: CampaignTasksComponent;
  @ViewChild('infoTab') infoTab: CampaignTabInfoComponent;
  @ViewChild('resultTab') resultTab: CampaignTabResultComponent;

  private campaignId: string;

  constructor(
    private route: ActivatedRoute,
    private campaignActions: CampaignActions) {}

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.campaignId = params['entityId'];
      if (this.campaignId) {
        this.campaignActions.fetchCampaignById(this.campaignId);
      } else {
        this.campaignActions.resetCampaignState();
      }
    });
  }

  ngOnDestroy() {
    this.campaignActions.resetCampaignState();
}

  ngOnChanges(changes: SimpleChanges) {}


  isShowInfoTabHeaderRedFlag() : boolean {
    return !this.infoTab.isValid() && this.isSubmitting();
  }

  isShowResultTabHeaderRedFlag():boolean{
    return !this.resultTab.isValid() && this.isSubmitting();
  }

  isSubmitting(){
    return this.campaignTasks.isSubmitting();
  }

  isValid(): boolean {
   return this.infoTab.isValid(this.isSubmitting()) && this.resultTab.isValid();
  }

  isDirty(): boolean {
    return this.infoTab.isDirty();
  }

}