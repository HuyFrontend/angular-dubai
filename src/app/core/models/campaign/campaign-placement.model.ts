import {EntityStatus} from '../entity.model'
export class CampaignPlacement {
    constructor(obj?: any) {
        this.id = obj && obj.id || '';
        this.destination = obj && obj.destination || '';
        this.pinable = obj && obj.pinable || false;
        this.placementOrder = obj && obj.placementOrder || 0;
    }
    id: string;

    destination: string;
    
    pinable: boolean;

    placementOrder: number;
}