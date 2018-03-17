export class CampaignInfo {

    constructor(obj?: any) {
        this.name = obj && obj.name || '';
        this.label = obj && obj.label || '';
        this.startActiveDateTime = obj && obj.startActiveDateTime || null;
        this.endActiveDateTime = obj && obj.endActiveDateTime || null;
    }

    name: string;
    label: string;
    startActiveDateTime: string;
    endActiveDateTime: string;
}