
export class PageGroupData {
    constructor() {
        this.type = '';
        this.title = '';
        this.followAllPages = false;
        this.instantPublishAllPages = false;
    }

    entityId: string;
    
    type: string;

    title: string;

    followAllPages: boolean;

    instantPublishAllPages: boolean;

    noPage: number;

    groupStatus: string;
}

export class PageGroupModel {

    entityId: string;

    status: string;

    type: string;

    publishedDate: any;

    createdDate: any;

    data: PageGroupData;

    checked: boolean;
}
