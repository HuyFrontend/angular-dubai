export interface ImageInfo {
    id?: string,    //entity id
    damId: string,  //Cloudinary id
    url: string,    //url of original images
    isDefault: boolean, //used for album (multiple images)
    tagToPages?: Array<{
            displayName: string,
            internalUniquePageName: string,
            entityId: string
        }>
    properties: {
        fileType: string,
        version: number,
    },
    metadata?: {
        description?: string,
        sourceLabel?: string,
        sourceLink?: string,
    }
}
