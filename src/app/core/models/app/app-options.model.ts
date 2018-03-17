import { ContentRelationship } from 'models';
import { EntityStatus } from 'models/entity.model';

export class AppOptions {

    constructor(obj?: any) {
        this.code = "";
        this.link = ""
    }

    code: string;
    link: string
}
