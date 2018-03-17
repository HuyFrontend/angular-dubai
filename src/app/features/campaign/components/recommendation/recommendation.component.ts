import { Component, ViewChild, AfterViewInit, OnInit} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';
import { CampaignActions } from 'state';
import { sortByAnyField } from 'utils';
import { dateFormatter } from 'utils/formatters';
import { NgForm } from '@angular/forms';
import { PageService, ContentService, AppService } from 'services';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { SORT_DIRECTION, NOTIFICATION_MESSAGE, CAMPAIGN_RECOMMENDATION_TARGET, SUGGESTION_TYPE } from 'constant';
import { CampaignPageRecommendation, CampaignContentRecommendation, Campaign, PageSuggestionRequest } from 'models';
import { AppConfigService } from 'services';

@Component({
    selector: 'campaign-recommendation',
    styleUrls: ['recommendation.component.scss'],
    templateUrl: 'recommendation.component.html'
})
export class CampaignRecommendationComponent implements OnInit {
    @select(['forms', 'campaign']) campaign$: Observable<Campaign>;

    @ViewChild('resultForm') form: NgForm;
    @ViewChild('confirmDelete') public confirmDelete: MBCConfirmationComponent;
    @ViewChild('confirmChangeResultType') public confirmChangeResultType: MBCConfirmationComponent;

    public listPageSelected = [];
    public listPagesToAdd = [];
    public campaign: Campaign;
    public dateFormatter = dateFormatter;
    public message = NOTIFICATION_MESSAGE;
    public recommendContent = [];
    public recommendPage = [];
    public RECOMMENDATION_TARGET = CAMPAIGN_RECOMMENDATION_TARGET;

    constructor(
        private pageService: PageService,
        private contentService: ContentService,
        private campaignAction: CampaignActions,
        private appConfigService: AppConfigService,
        private appService: AppService
        ) {}

    ngOnInit() {
        this.campaign$.subscribe(c => {
            this.campaign = c;
            this.fetchDetailRecommendations();
            this.getConfigData();
        });
    }

    getConfigData(){
        this.appConfigService.fetchCampaignConfigs()
        .subscribe(data => {
            this.recommendContent =  data.recommendContent.map(x=><any>{
                text: x.names[0].text,
                value: x.code
            });
            this.recommendContent.unshift({text: 'Select', value: ''});
            this.recommendPage = data.recommendPage.map(x=><any>{
                text: x.names[0].text,
                value: x.code
            });
            this.recommendPage.unshift({text: 'Select', value: ''});
        });
    }

    appendDetailRecommendations(ids: string[]){
        if(this.campaign.result.recommend === CAMPAIGN_RECOMMENDATION_TARGET.PAGE){
                this.pageService.fetchPageByIds(ids)
                .subscribe(result=>{
                    this.campaign.result.recommendationsDetail =
                                    this.campaign.result.recommendationsDetail
                                    .concat(result.map(x=>this.mapModelToDetailRecommendation(x)));
                    this.updateRecomendationToState();
                });
        }
    }

    fetchDetailRecommendations(){
        if(!this.campaign.result){
            return ;
        }
        this.campaign.result.recommendationsDetail = [];
        const result = this.campaign.result;
        const recommend = result.recommend;
        if(recommend == CAMPAIGN_RECOMMENDATION_TARGET.PAGE){
          if(result.pageManualData &&
            result.pageManualData.pageIds &&
            result.pageManualData.pageIds.length > 0){
              this.pageService.fetchPageByIds(result.pageManualData.pageIds)
              .subscribe(data=>{
                  this.sortRecommendationsDetailByIds(data.map(x=>this.mapModelToDetailRecommendation(x)),
                  result.pageManualData.pageIds);
              });
          }
        }
        if(this.isTargetContent()){
            if(result.contentManualData &&
              result.contentManualData.contentIds &&
              result.contentManualData.contentIds.length > 0){
                this.contentService.fetchContentAndRelativesByIds(result.contentManualData.contentIds)
                .subscribe(data=>{
                    this.sortRecommendationsDetailByIds(data.map(x=>this.mapModelToDetailRecommendation(x)),
                    result.contentManualData.contentIds );
                })
            }
        }
    }

    sortRecommendationsDetailByIds(recommendationsDetail:any[], ids:string[]){
        this.campaign.result.recommendationsDetail = [];
        ids.forEach(x=>{
            this.campaign.result.recommendationsDetail.push(recommendationsDetail.filter(re=>re.entityId == x)[0]);
        });
    }

    onQueryPage({ val, updateEvent }) {
        const _updateEvent: BehaviorSubject<any> = updateEvent;
        const excludeIds = this.campaign.result.recommendationsDetail.map(x=>x.entityId);
        switch(this.campaign.result.recommend){
          case CAMPAIGN_RECOMMENDATION_TARGET.PAGE:
            this.pageService
              .suggest(new PageSuggestionRequest(SUGGESTION_TYPE.PAGE_CAMPAIGN_RECOMMEND, val, null, null, excludeIds))
              .subscribe(listPage => {
                _updateEvent.next(this.convertToContentRelationship(listPage, 'internalUniquePageName'));
              });
            break;
          case CAMPAIGN_RECOMMENDATION_TARGET.CONTENT:
          case CAMPAIGN_RECOMMENDATION_TARGET.APP:
            let suggestionType = SUGGESTION_TYPE.CONTENT_CAMPAIGN;
            if(this.campaign.result.recommend == CAMPAIGN_RECOMMENDATION_TARGET.APP){
              suggestionType = SUGGESTION_TYPE.APP_RECOMMENDATION;
            }
            this.contentService
                .suggestContent(val, suggestionType, excludeIds)
                .subscribe(result => {
                  _updateEvent.next(this.convertToContentRelationship(result.map(x=>
                  {
                      return <any>{
                          title: x.data.title,
                          internalUniquePageName: x.data.title,
                          entityId: x.entityId,
                          publishedDate: x.publishedDate,
                          status: x.status,
                          site: x.data.relatedEntity.data.info.website,
                          publishedOnBehalf: x.data.relatedEntity.data.info.internalUniquePageName
                  }
                }),'internalUniquePageName'));
              });
            break;
        }
    }

    convertToContentRelationship(listItem: any[], key) {
        const display = 'displayName';
        listItem.map((item, idx, ar) => {
          item[display] = item[key];
          return item;
        });
        return listItem;
    }

    addPageToCampaign(){
      const recommend = this.campaign.result.recommend;
      if(this.isTargetContent()){
              this.campaign.result.recommendationsDetail =
              this.campaign.result.recommendationsDetail.concat(this.listPagesToAdd);
              this.updateRecomendationToState();
      }
      else {
          this.appendDetailRecommendations(this.listPagesToAdd.map(x=>x.entityId));
      }
      this.listPageSelected = [];
      this.listPagesToAdd = []
    }

    mapModelToDetailRecommendation(model:any){
        return <any>{
            title: model.data.title,
            site:model.data.website ? model.data.info.website : 'www.mbc.net',
            internalUniquePageName: model.data.info ? model.data.info.internalUniquePageName : '',
            publishedOnBehalf:model.data.relatedEntity ? model.data.relatedEntity.data.info.internalUniquePageName : '',
            publishedDate: model.publishedDate,
            entityId: model.entityId,
            status: model.status
        };
    }

    updateRecomendationToState(){
        let entityIds = this.campaign.result.recommendationsDetail.map(x=>x.entityId);
        let recommend = this.campaign.result.recommend;
        if(recommend == CAMPAIGN_RECOMMENDATION_TARGET.PAGE){
          this.campaign.result.pageManualData.pageIds = entityIds;
        }
        if(this.isTargetContent()){
            this.campaign.result.contentManualData.contentIds = entityIds;
        }
        this.campaignAction.updateState(this.campaign);
    }

    onAddedPage(obj: any) {
        if (obj) {
          this.listPagesToAdd.push(obj);
        }
    }

    onRemovePage(page: any) {
        if (page) {
            this.listPagesToAdd = this.listPagesToAdd.filter(x=>x.entityId != page.entityId);
        }
    }

    movePageHandler(index, seek: number){
        const temp = this.campaign.result.recommendationsDetail[index];
        this.campaign.result.recommendationsDetail[index] = this.campaign.result.recommendationsDetail[index + seek];
        this.campaign.result.recommendationsDetail[index + seek] = temp;
        this.updateRecomendationToState();
    }

    removeRecommedation(entry:any){
        this.confirmDelete.show(entry);
    }

    removeRecommedationHandler(entry:any){
        this.campaign.result.recommendationsDetail = this.campaign.result.recommendationsDetail
                                                        .filter(x=>x.entityId != entry.entityId);
        this.updateRecomendationToState();
    }

    movedItemsHandler(listChange:any){
        listChange.forEach(element => {
            const listFilter = this.campaign.result.recommendationsDetail.filter(x=>x.entityId == element.entityId);
            if(listFilter.length > 0){
                listFilter[0].order = element.order;
            }
        });

        this.campaign.result.recommendationsDetail = sortByAnyField(this.campaign.result.recommendationsDetail
                                                                        , 'order', SORT_DIRECTION.ASC)
        this.updateRecomendationToState();
    }

    targetRecommendationChange($event){
        if(this.campaign.result.recommendationsDetail && this.campaign.result.recommendationsDetail.length > 0){
            this.confirmChangeResultType.show({data: $event});
        }
    }

    changeResultOptionHandlerYes($event){
        this.campaign.result.contentManualData = new CampaignContentRecommendation();
        this.campaign.result.pageManualData = new CampaignPageRecommendation();
        this.campaign.result.recommendationsDetail = [];
        this.campaignAction.updateState(this.campaign);
    }

    changeResultOptionHandlerNo($event){
        this.campaign.result.recommend = $event.data.old;
        this.campaignAction.updateState(this.campaign);
    }

    isTargetContent(){
      return this.campaign.result.recommend == CAMPAIGN_RECOMMENDATION_TARGET.APP ||
            this.campaign.result.recommend == CAMPAIGN_RECOMMENDATION_TARGET.CONTENT
    }
}

