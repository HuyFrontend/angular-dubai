import { ContentRelationship } from 'models';
import { EntityStatus } from 'models/entity.model';

export class AppInfo {

    constructor(obj?: any) {
        this.id = obj && obj.id || null;
        this.description = "";
        this.title = "";
        this.interests = [];
        this.tagToPages = [];
        this.publishedDateTime = obj && obj.publishedDateTime || null;
        this.createdDateTime = obj && obj.createdDateTime || null;
        this.status = obj && obj.status || null;
        this.type = obj && obj.type || '';
        this.publishOnBehalf = new ContentRelationship("", "", "");
    }

    id: string;
    title: string;
    publishOnBehalf: ContentRelationship;
    publishedDateTime: any;
    createdDateTime: any;
    status: EntityStatus;
    interests: ContentRelationship[];
    tagToPages: ContentRelationship[];
    description: string;
    type: string;
}
