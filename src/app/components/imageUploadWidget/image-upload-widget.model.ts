import { CLOUDINARY } from 'constant';
import { ImageInfo } from 'models';
export type ImageRatio = 'original' | '16_9' | '16_16' | '27_40';

export class ActionButton {
    title: string;
    fontAwesomeClass: string;
    callback: Function;
    param?: any;
    style: any;
}

export class ImageUploadWidgetOption {

    constructor() {
        this.isRequired = false;
        this.isHideMetadata = false;
        this.isAbleToClearImage  = true;
        this.isCollapsable = true;
        this.maxFileSize = CLOUDINARY.MAX_FILE_SIZE;
        this.defaultRatio = 'original';
        this.actionButtons = [];
    }

    isRequired: boolean;
    isHideMetadata: boolean;
    isCollapsable: boolean;
    isAbleToClearImage: boolean;
    maxFileSize: number;
    defaultRatio: ImageRatio;
    actionButtons: ActionButton[];
}

export class ImageUploadWidgetImageInfo implements ImageInfo {
    id?: string;
    damId: string;
    url: string;
    url16_9?: string;   //url of images with ratio 16_9
    url16_16?: string;  //url of images with ratio 16_16
    url27_40?: string;  //url of images with ratio 27_40
    isDefault: boolean;
    tagToPages?: Array<{
            displayName: string
            internalUniquePageName: string
            entityId: string
        }>
    properties: {
        fileType: string
        version: number
    }
    metadata?: {
        description?: string
        sourceLabel?: string
        sourceLink?: string
    }

    // TODO: will remome this when the page images are refactored 
    sizes?: {
        original?: string
        portrait?: string
        landscape?: string
        square?: string
    }
}