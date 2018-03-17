import { ImageInfo } from '../image-info.model';
import { VIEW_OPTIONS, PARAGRAPH_TYPE } from 'constant';
import { Paragraph, IParagraph, ParagraphText } from './paragraph.model';
import { ContentRelationship } from './relationship.model';
import { IEntity, EntityStatus } from '../entity.model'

class Content implements IEntity {
    constructor() {
        this.title = '';
        this.language = 'ar';
        this.label = '';
        this.featureOnStream =  false;
    }
    entityId: string;
    status: EntityStatus;
    featureOnStream: boolean;
    checked: boolean;
    language: string;
    title: string;
    label: string;
    publishedDate: any;
    publishOnBehalf: ContentRelationship;
    websites: ContentRelationship[];
    tagToPages: ContentRelationship[];
    interests: string[];

    paragraphs: IParagraph[];

    /**
     * After fetch Article from server,
     * this function help to convert to Article object to display in UI.
     *
     * @static
     * @param {*} entity
     * @returns {Article}
     *
     * @memberOf Article
     */
    static convertFromEntity(entity: any): Content {
        let tempArticle = <Content> {
            ...entity.data
        };

        tempArticle.entityId = entity.entityId;
        tempArticle.status = entity.status;
        tempArticle.publishedDate = entity.publishedDate;

        return tempArticle;
    }
}

class Article extends Content {
    constructor() {
        super();
        this.paragraphViewOption = VIEW_OPTIONS.STANDARD;
        this.description = '';

        this.websites = [new ContentRelationship('relationShipId', 'entityId', 'mbc.net')];
        this.interests = [];
        this.tagToPages = [];
        this.paragraphs = [];
    }
    articlePhoto: ImageInfo;
    description: string;
    paragraphViewOption: string; // One of value: STANDARD, NUMBERED, COUNT_DOWN
}

class Post extends Content {
    constructor() {
        super();
        this.description = "";
        this.websites = [
            new ContentRelationship("relationShipId", "entityId", "mbc.net")
        ];
        this.interests = [];
        this.tagToPages = [];
        this.type = "post"; //Default value
        this.paragraphs = [new ParagraphText(PARAGRAPH_TYPE.TEXT, 0)];
    }
    type: string;
    description: string;

    static convertFromEntity(entity: any): Content {
        const uiEntity = super.convertFromEntity(entity);
        const defaultPost = new Post();
        return <Content>{
            ...defaultPost,
            ...uiEntity
        };
    }
}


export {
    IEntity,
    Content,
    Article,
    Post
}
