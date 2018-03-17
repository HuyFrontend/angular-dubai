import { Component, ViewChild, AfterViewInit, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { select } from '@angular-redux/store';
import { NgForm } from '@angular/forms';
import { Campaign } from 'models';
import { CampaignActions } from 'state';
import { CAMPAIGN_STATUS } from 'constant';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'campaign-tab-info',
  styleUrls: ['campaign-tab-info.scss'],
  templateUrl: 'campaign-tab-info.html',
})

export class CampaignTabInfoComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('infoForm') form: NgForm;
  @select(['forms', 'campaign']) campaign$: Observable<Campaign>;

  public campaign: Campaign;
  private campaignSubscription: Subscription;
  public originalName: string = '';

  constructor(private campaignAction: CampaignActions) {
  }

  ngOnInit() {
    this.campaignSubscription = this.campaign$.subscribe(c => {
      this.campaign = c;
      if (!this.originalName) {
        this.originalName = this.campaign.info.name;
      }
    });
  }

  ngAfterViewInit() {
    this.form.valueChanges
      .subscribe(values => this.campaignAction.updateState(values));
  }

  ngOnDestroy() {
    this.form.resetForm();
    this.campaignSubscription.unsubscribe();
  }

  isValid(isSubmitting = false): boolean {
    if(isSubmitting){
      this.form.form.controls.name.markAsDirty();
      this.form.form.controls.label.markAsDirty();
    }
    return !this.form.invalid;
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  isCampaignActive(): boolean {
    return this.campaign.status === CAMPAIGN_STATUS.LIVE || this.campaign.status === CAMPAIGN_STATUS.PARTIALLIVE || this.campaign.status === CAMPAIGN_STATUS.PENDINGLIVE;
  }
}
