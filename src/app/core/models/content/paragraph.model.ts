import { ImageInfo, PhotoAlbum } from 'models';

type ParagraphType = 'image' | 'text' | 'ebbed' | 'live';

export interface IParagraph {
    id: number;
    order: number;
    relationshipId: string;
    entityId: string;
    title: string;
    type: string;
    description: string;
}
export class Paragraph implements IParagraph {
    constructor(type: string, order?: number) {
        this.id = Math.floor(Date.now() / 1000);
        this.type = type;
        this.entityId = '';
        this.relationshipId = '';
        this.order = order;
        this.title = '';
        this.description = '';
    }
    id: number;
    order: number;
    relationshipId: string;
    entityId: string;
    title: string;
    type: string;
    description: string;

    /**
     * Convert data that return from server to Paragraph type
     * to display in UI.
     *
     * @static
     * @param {*} entity
     * @returns {ParagraphText}
     *
     * @memberOf Paragraph
     */
    static convertToView(entity: any): IParagraph {
        let textParagraph = <IParagraph> {
            ...entity.data,
            entityId: entity.entityId
        };

        return textParagraph;
    }
}

export class ParagraphText extends Paragraph {}

export class ParagraphImage extends Paragraph {
    constructor(type: string, order?: number) {
        super(type, order);

        this.sourceLink = '';
        this.sourceLabel = '';
        this.tagToPages = [];
        this.label = '';
        this.image = undefined;
    }
    label: string;
    sourceLink: string = '';
    sourceLabel: string = '';
    image: ImageInfo;
    tagToPages: any[];
}

export class ParagraphImagePost extends Paragraph {
    constructor(type: string, order?: number) {
        super(type, order);
        this.image = new PhotoAlbum();
    }
    image: PhotoAlbum;
}

export class ParagraphEmbeddedCode extends Paragraph {
    constructor(type: string, order?: number) {
        super(type, order);

        this.codeSnippet = '';
        this.sourceName = '';
    }
    codeSnippet: string = '';
    sourceName: string = '';
}
