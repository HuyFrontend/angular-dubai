import { CampaignPageRecommendation } from './campaign-page-recommendation.model';
import { CampaignContentRecommendation } from './campaign-content-recommendation.model';
import { CampaignPlacement } from './campaign-placement.model';
import {CAMPAIGN_RESULT_TYPE, CAMPAIGN_RESULT_MODE} from 'constant';
export class CampaignResult {

    constructor(obj?: any) {
        this.type = obj && obj.type || CAMPAIGN_RESULT_TYPE.CONTENT;
        this.mode = obj && obj.mode || CAMPAIGN_RESULT_MODE.MANUAL;
        this.recommend = obj && obj.recommend || '';
        this.results = obj && obj.results || 0;
        this.numberOfResultShow = obj && obj.numberOfResultShow || 10;
        this.placementMode = obj && obj.placementMode || '';
        this.placements = obj && obj.placements || [new CampaignPlacement()];
        this.contentManualData = obj && obj.contentManualData || new CampaignContentRecommendation();
        this.contentDynamicData = obj && obj.contentDynamicData || new CampaignContentRecommendation();
        this.pageManualData = obj && obj.pageManualData || new CampaignPageRecommendation();
        this.pageDynamicData = obj && obj.pageDynamicData || new CampaignPageRecommendation();
        this.metaData = obj && obj.metaData || null;
        this.recommendationsDetail = [];
    }

    type: string;
    mode: string;
    results: number;
    numberOfResultShow: number;
    placementMode: string;
    placements: Array<CampaignPlacement>;
    recommend:string;
    contentManualData: CampaignContentRecommendation;
    contentDynamicData: CampaignContentRecommendation;
    pageManualData: CampaignPageRecommendation;
    pageDynamicData: CampaignPageRecommendation;
    recommendationsDetail:any[];
    metaData: any;
}
