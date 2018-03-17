
import { CampaignInfo, CampaignTargetAudience, CampaignResult } from './campaign'

export type CampaignStatus = 'draft' | 'inactive' | 'live' | 'pendingLive' | 'partialLive' ;

export class Campaign {

    constructor(obj?: any) {
        this.id = obj && obj.id || null;
        this.info = obj && obj.info || new CampaignInfo();
        this.targetAudience = obj && obj.targetAudience || new CampaignTargetAudience();
        this.result = obj && obj.result || new CampaignResult();
        this.publishedDateTime = obj && obj.publishedDateTime || null;
        this.createdDateTime = obj && obj.createdDateTime || null;
        this.status = obj && obj.status || null;
    }
    checked: boolean;
    id: string;
    info: CampaignInfo;
    targetAudience: CampaignTargetAudience;
    result: CampaignResult;
    publishedDateTime: any;
    createdDateTime: any;
    status: CampaignStatus;
}
