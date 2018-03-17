import { RELATIONSHIP_TYPE } from 'constant';
import { Paragraph, ParagraphImage} from './paragraph.model';
import { Content, Article, Post } from './content.model';
import { ContentRelationship } from './relationship.model';
import { ParagraphHelper } from 'utils/paragraph-helper';
import { PARAGRAPH_TYPE } from 'constant';

const ContentMapping = {
    attachToArticle: (article: Article, key: string, relatedEntity: object, relationship: any): void => {
        const convertedKey = ContentMapping.correctType(key);
        article[convertedKey] = ContentMapping[key](article[convertedKey], relatedEntity, relationship);

        if(article["hasImage"]){
          article.articlePhoto = article["hasImage"];
          delete article["hasImage"];
        }

        const { paragraphs } = article;
        if(paragraphs && paragraphs.length > 0) {
            paragraphs.sort((first, second) => {
                if (first.order < second.order)
                return -1;
                if (first.order > second.order)
                    return 1;
                return 0;
            });
        }
    },

    attachToPost: (post: Post, key: string, relatedEntity: object, relationship: any): void => {
        const convertedKey = ContentMapping.correctType(key);
        if(convertedKey){
          post[convertedKey] = ContentMapping[key](post[convertedKey], relatedEntity, relationship);
        }
        post.paragraphs = [ContentMapping.paragraphOfPost(post)];
        // TODO: Temporary display the websites since we haven't got the sites relation yet.
        post.websites = [new ContentRelationship('relationShipId', 'entityId', 'mbc.net')];
    },

    correctType: (key: string) => key == 'paragraph' ? 'paragraphs' : key,

    displayName: (entity: any, key: string) => entity[key],

    publishOnBehalf: (originalObj: any, relatedEntity: any, relationship: any): any => {
        const { entity: { data: page } } = relatedEntity;
        let publishOnBehalf = originalObj ? { ...originalObj } : {};
        publishOnBehalf = new ContentRelationship(
            relationship.entityId,
            relationship.toId,
            page.info.internalUniquePageName);

        return publishOnBehalf;
    },

    paragraph: (originalObj: any[], relatedEntity: any, relationship: any): Paragraph[] => {
        let paragraph = Paragraph.convertToView(relatedEntity.entity);
        paragraph.relationshipId = relationship.entityId;
        if(relationship.properties){
            paragraph.order = relationship.properties.order;
        }
        let newParagraphs = originalObj ? [ ...originalObj ] : [];

        // check paragraph type is image then process convert tagToPages array.
        if(paragraph.type === PARAGRAPH_TYPE.IMAGE) {
            let paragraphImage = paragraph as ParagraphImage;
            let tagToPages = [];
            if(relatedEntity.relatedEntities) {
                relatedEntity.relatedEntities.forEach((entityRelationship) => {
                    const { relationship, relatedEntity } = entityRelationship;

                    //FIXME separate paragraph between article/ post as in future if we have another entity (that have paragraph)
                    //  then we may end up in collision as structure between them might be different
                    //Only article can sastify this condition as Post paragraph have relation of HAS_ALBUM (not HAS_IMAGE)
                    if(relationship.type == RELATIONSHIP_TYPE.HAS_IMAGE){
                      paragraphImage.image = relatedEntity.entity.data;
                      paragraphImage.image.id = relatedEntity.entity.entityId;

                      if(relatedEntity.relatedEntities){
                        let tagToPagesEntities = relatedEntity.relatedEntities.filter(r => r.relationship.type == RELATIONSHIP_TYPE.TAG_TO_PAGE);
                        if(tagToPagesEntities.length > 0) {

                          tagToPagesEntities.forEach(tagEntity => {
                            const { relatedEntity: {entity:{ data } }, relationship: tagRelationship } = tagEntity;
                            tagToPages.push(new ContentRelationship(
                                tagRelationship.entityId,
                                tagRelationship.toId,
                                data.info.internalUniquePageName));
                          });

                        }
                      }
                      paragraphImage.image.tagToPages = tagToPages;
                    }
                  });
                }

            newParagraphs.push(paragraphImage);
            return newParagraphs;
        }

        newParagraphs.push(paragraph);
        return newParagraphs;
    },

    tagToPages: (originalObj: any[], relatedEntity: any, relationship: any): any[] => {
        const { entity:{ data: page } } = relatedEntity;

        let newArr = originalObj ? [ ...originalObj ] : [];
        newArr.push(new ContentRelationship(
            relationship.entityId,
            relationship.toId,
            page.info.internalUniquePageName));
        return newArr;
    },

    paragraphOfPost: (post: Post) : Paragraph => {
      const p: Paragraph =  ParagraphHelper.createParagraph(post.type, 0);
      Object.keys(p).map((key, idx, arr) => {
        p[key] = post[key];
      });
      // Specific for image paragraph
      p['label'] = post['imageLabel'];
      p['image'] = post['hasAlbum'];

      return p;
    },

    hasImage: (originalObj: any[], relatedEntity: any, relationship: any): any[] => {
        const { entity: {data: image }} = relatedEntity;
        const imageRelatedEntity = relatedEntity.relatedEntities || [];
        const tagges = imageRelatedEntity
            .filter(relationEntity => relationEntity.relationship.type === 'tagToPages')
            .reduce(
                (tagArray, tagEntity) => ContentMapping.tagToPages(tagArray, tagEntity.relatedEntity, tagEntity.relationship)
                , []);
        image.tagToPages = tagges;
        return image;
    },

    hasAlbum: (originalObj: any[], relatedEntity: any, relationship: any): any[] => {
        const { entity: { data: albumData } } = relatedEntity;
        const { relatedEntities } = relatedEntity;
        const images = relatedEntities
            .filter(relationEntity => relationEntity.relationship.type === 'hasImage')
            .sort((a, b) => a.relationship.properties.order - b.relationship.properties.order)
            .map(imageRelationEntity => {
                const { relatedEntity : {entity: {data: image }}} = imageRelationEntity;
                const imageRelatedEntity = imageRelationEntity.relatedEntity.relatedEntities || [];
                const tagges = imageRelatedEntity
                    .filter(relationEntity => relationEntity.relationship.type === 'tagToPages')
                    .reduce(
                        (tagArray, tagEntity) => ContentMapping.tagToPages(tagArray, tagEntity.relatedEntity, tagEntity.relationship)
                        , []);
                image.tagToPages = tagges;
                return image;
            })

        const albumTagToPages = relatedEntities
            .filter(relationEntity => relationEntity.relationship.type === 'tagToPages')
            .reduce(
                (tagArray, tagEntity) => ContentMapping.tagToPages(tagArray, tagEntity.relatedEntity, tagEntity.relationship)
                , []);
        albumData.images = images;
        albumData.tagToPages = albumTagToPages;
        return albumData;
    }
}

export {
    ContentMapping
}
