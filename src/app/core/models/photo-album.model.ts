import { ImageInfo } from 'models';

export type PhotoAlbumType = 'single' | 'multiple';

export class PhotoAlbum {
    constructor() {
        this.id = undefined;
        this.title = '';
        this.tagToPages = [];
        this.description = '';
        this.images = [];
    }
    id: string; //entity id;
    type: PhotoAlbumType;
    title?: string;
    tagToPages?: Array<{
        displayName: string,
        internalUniquePageName: string,
        entityId: string
    }>;
    description?: string;
    images?: Array<ImageInfo>;
}