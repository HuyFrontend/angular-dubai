import { Component, Input, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { select } from '@angular-redux/store';
import { NgForm } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import { Campaign, CampaignResult, CampaignContentRecommendation, CampaignPageRecommendation} from 'models';
import { CampaignActions } from 'state';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { CAMPAIGN_RESULT_TYPE, CAMPAIGN_RESULT_MODE, NOTIFICATION_MESSAGE } from 'constant';
@Component({
    selector: 'campaign-result-option',
    styleUrls: ['result-option.scss'],
    templateUrl: 'result-option.html',
})

export class CampaignResultOptionComponent implements OnInit, AfterViewInit {
    @ViewChild('resultForm') form: NgForm;
    @select(['forms', 'campaign']) campaign$: Observable<Campaign>;
    @ViewChild('confirmChangeResultType') public confirmChangeResultType: MBCConfirmationComponent;

    public campaign: Campaign = new Campaign();
    public message = NOTIFICATION_MESSAGE;

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
        return this.form.valid;
    }

    resultOptionChangeAction(value:any, resultTypeChange: boolean){
        if(this.getRecommendationResults() > 0){
            this.confirmChangeResultType.show({resultType: value, resultTypeChange});
        }
    }

    getRecommendationResults(){
        if(this.campaign.result.contentManualData && 
            this.campaign.result.contentManualData.contentIds &&
            this.campaign.result.contentManualData.contentIds.length > 0){
                    return this.campaign.result.contentManualData.contentIds.length;
        }
        if(this.campaign.result.pageManualData &&
            this.campaign.result.pageManualData.pageIds &&
            this.campaign.result.pageManualData.pageIds.length > 0){
                return this.campaign.result.pageManualData.pageIds.length;
        }
        return 0;
    }

    changeResultOptionHandlerYes($event){
        this.campaign.result.contentManualData = new CampaignContentRecommendation();
        this.campaign.result.pageManualData = new CampaignPageRecommendation();
        this.campaign.result.recommendationsDetail = [];
        this.campaignAction.updateState(this.campaign);
    }

    changeResultOptionHandlerNo($event){
        if($event.resultTypeChange){
            this.campaign.result.type = $event.resultType == CAMPAIGN_RESULT_TYPE.CONTENT ? 
                                                    CAMPAIGN_RESULT_TYPE.PAGE : 
                                                    CAMPAIGN_RESULT_TYPE.CONTENT;
        }
        else{
            this.campaign.result.numberOfResultShow = parseInt($event.resultType.old);
        }
        this.campaignAction.updateState(this.campaign);
    }

    public resultTypes = [{
        value: 'CONTENT',
        display: 'Content',
    },
    {
        value: 'PAGE',
        display: 'Pages'
    }];

    public resultModes = [{
        value: 'MANUAL',
        display: 'Manual',
    },
    {
        value: 'DYNAMIC',
        display: 'Dynamic'
    }];

    public resultSelectOptions = [
        {value: 10, text: '10'},
        {value: 20, text: '20'},
        {value: 30, text: '30'},
        {value: 40, text: '40'},
        {value: 50, text: '50'},
        {value: 60, text: '60'},
        {value: 70, text: '70'},
        {value: 80, text: '80'},
        {value: 90, text: '90'},
        {value: 100, text: '100'},
        {value: 200, text: '200'},
        {value: 300, text: '300'},
        {value: 400, text: '400'},
        {value: 500, text: '500'},
    ];
}
