import { Component, ViewChild, AfterViewInit, OnInit, Input } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { NgForm, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Campaign } from 'models';
import { CampaignActions } from 'state';

import { CampaignResultOptionComponent } from './resultOption';
import { CampaignPlacementComponent } from '../placement'; 

@Component({
    selector: 'campaign-tab-result',
    styleUrls: ['campaign-tab-result.scss'],
    templateUrl: 'campaign-tab-result.html',
})

export class CampaignTabResultComponent implements AfterViewInit, OnInit {
    @ViewChild('resultForm') form: NgForm;
    @ViewChild('resultOption') resultOption: CampaignResultOptionComponent;
    @ViewChild('placement') placement: CampaignPlacementComponent;
    
    @select(['forms', 'campaign']) campaign$: Observable<Campaign>;

    @Input() isSubmitting: boolean;


    public campaign: Campaign = new Campaign();

    constructor(private campaignAction: CampaignActions) {
    
    }

    ngOnInit() {
        this.campaign$.subscribe(c => {
            this.campaign = c;
        });
    }

    ngAfterViewInit() {
        this.form.valueChanges
        .subscribe(values => this.campaignAction.updateState(values));
    }

    isValid(): boolean {
        return this.form.valid && (this.placement && this.placement.isValid());
    }

}
