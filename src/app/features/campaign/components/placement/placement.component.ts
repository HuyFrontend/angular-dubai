import { Component, ViewChild, AfterViewInit, OnInit, Input } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Campaign, CampaignPlacement } from 'models';
import { CampaignActions } from 'state';
import { NgForm } from '@angular/forms';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { CAMPAIGN_PLACEMENT_MODE, CAMPAIGN_PLACEMENT_DESTINATION, NOTIFICATION_MESSAGE } from 'constant';
import { AppConfigService } from 'services';
@Component({
    selector: 'campaign-placement',
    templateUrl: 'placement.component.html'
})

export class CampaignPlacementComponent implements OnInit, AfterViewInit {
    @ViewChild('resultForm') form: NgForm;
    @ViewChild('confirmChangePlacementMode') public confirmChangePlacementMode: MBCConfirmationComponent;
    @select(['forms', 'campaign']) campaign$: Observable<Campaign>;
    @Input() isSubmitting: boolean;

    public campaign: Campaign;
    public orderList : any[] = [];
    public placementListAll : any[] = [];
    public placementList : any[] = [];
    public modeContent: any[] = [];
    public modePage: any[] = [];
    public message = NOTIFICATION_MESSAGE;

    constructor(
        private campaignAction: CampaignActions,
        private appConfigService: AppConfigService
        ) {}

    ngOnInit() {
      this.campaign$.subscribe(c => {
          this.campaign = c;
          this.getConfigData();
      });
    }

    ngAfterViewInit() {
        this.form.valueChanges
            .subscribe(values => this.campaignAction.updateState(values));
    }

    getConfigData(){
        this.appConfigService.fetchCampaignConfigs()
        .subscribe(data => {
            this.orderList = data.order.map(elem => ({text: elem.names[0].text, value: elem.code}));
            this.placementListAll = data.destinations.map(elem => ({text: elem.names[0].text, value: elem.code}));

            if(this.campaign.result){
              this.updatePlacementSource(this.campaign.result.placementMode);
            }

            this.modeContent  = data.modeContent.map(x=><any>{
                text: x.names[0].text,
                value: x.code
            });
            this.modeContent.unshift({text: 'Select', value: ''});

            this.modePage = data.modePage.map(x=><any>{
                text: x.names[0].text,
                value: x.code
            });
            this.modePage.unshift({text: 'Select', value: ''});
        });
    }

    addNewHandler(){
        this.campaign.result.placements.push(new CampaignPlacement());
        this.campaignAction.updateState(this.campaign);
    }

    removePlacement(page: any) {
        if (page) {
            this.campaign.result.placements = this.campaign.result.placements.filter(x=>x != page);
            this.campaignAction.updateState(this.campaign);
        }
    }

    isStreamCard(): boolean {
        return this.campaign.result.placementMode == CAMPAIGN_PLACEMENT_MODE.STREAM_CARD;
    }

    isValid(): boolean {
        if(this.campaign.result.placementMode == '' || this.campaign.result.placements.length <=0){
            return false;
        }
        const destination = this.getDestination();
        if(destination.length <=0){
            return false;
        }
        const invalidPlacements = destination.filter(x=> (!x.destination || x.destination == '') ||
                                    (this.campaign.result.placementMode != CAMPAIGN_PLACEMENT_MODE.STREAM_CARD &&
                                    (x.placementOrder==0) ));
        return invalidPlacements.length <= 0;
    }

    isDirty(): boolean{
        return this.form.dirty;
    }

    getDestination(){
      return this.campaign.result.placements.filter(x=>x.destination || x.placementOrder != 0);
    }

    onPlacementModeChange($event){
      if(this.getDestination().length > 0 &&
            ($event.old == CAMPAIGN_PLACEMENT_MODE.LISTING ||
              $event.new == CAMPAIGN_PLACEMENT_MODE.LISTING ||
              $event.new == '') ){
          this.confirmChangePlacementMode.show($event);
          return;
      }
      this.updatePlacementSource($event.new);
    }

    updatePlacementSource(placementMode: string){
      if(placementMode == ''){
        this.placementList = [];
        return;
      }

      if(placementMode == CAMPAIGN_PLACEMENT_MODE.LISTING){
        this.placementList = this.placementListAll.filter(x=>x.value != CAMPAIGN_PLACEMENT_DESTINATION.NEWS_FEED &&
                                                              x.value != CAMPAIGN_PLACEMENT_DESTINATION.VIDEO)
      }
      else{
        this.placementList = this.placementListAll.filter(x=>x.value == CAMPAIGN_PLACEMENT_DESTINATION.NEWS_FEED ||
                                                              x.value == CAMPAIGN_PLACEMENT_DESTINATION.VIDEO)
      }
    }

    onPlacementModeChangeYes($event){
      this.updatePlacementSource($event.new);
      this.campaign.result.placements = [new CampaignPlacement()];
      this.campaignAction.updateState(this.campaign);
    }

    onPlacementModeChangeNo($event){
      this.campaign.result.placementMode = $event.old;
      this.campaignAction.updateState(this.campaign);
    }
}
