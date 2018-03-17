import { PhotoAlbum, ImageInfo } from 'models';
import { ParagraphImagePost } from '../models/content/paragraph.model';
import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';
import { FormActions } from './form.state';
import { AlertsActions } from './alerts.state';
import { BaseActions } from './base.state';
import { IContentState, IAppState, FormType } from './app-interfaces';
import { ContentService } from 'services';
import { Content, Post, EntityRequest, ParagraphText, ParagraphImage, ParagraphEmbeddedCode } from 'models';
import { RelationshipRequest, ContentRelationship, UpdateRelationshipRequest, ContentMapping } from 'models';
import { NOTIFICATION_TYPE, VIEW_OPTIONS, PARAGRAPH_TYPE } from 'constant';
import { FormGroup } from '@angular/forms';

@Injectable()
export class PostActions extends BaseActions {
  constructor(
    protected redux: NgRedux<IAppState>,
    protected alertsActions: AlertsActions,
    protected formActions: FormActions,
    protected contentService: ContentService
  ) {
    super(redux, alertsActions, formActions, contentService)
  }

  public initPostForm(post = new Post()): void {
    this.initSession()
      .subscribe(editingSession => {
        this.initForm(editingSession, post);
      });
  }

  public saveEntity(): Observable<any> {
    const type = this.getContentType();
    const entity = this.getContent();
    const { form: { tagToPages } } = this.redux.getState();
    const entityRequest = new EntityRequest();
    entityRequest.type = type;
    entityRequest.entityId = entity.entityId;
    entityRequest.data = this.transferParagraphToPost(entity, tagToPages);
    if(!entityRequest.entityId) {
      return this.contentService.createPost(entityRequest);
    } else {
      return this.contentService.updatePost(entityRequest);
    }

  }

  public updateRelationships(entityId: string): Observable < any > {
    const { form: { editingSession, publishOnBehalf, tagToPages } } = this.redux.getState();
    let deletedRelationships = [];
    let addedRelationships = [];

    // New relatoionships
    if(publishOnBehalf.new) {
      if(publishOnBehalf.old) {
        deletedRelationships.push(publishOnBehalf.old.relationshipId);
      }
      addedRelationships.push({
        fromId: entityId,
        toId: publishOnBehalf.new,
        type: 'publishOnBehalf',
      });
    }
    if (tagToPages.new.length) {
      tagToPages.new.map(pageId => addedRelationships.push({
        fromId: entityId,
        toId: pageId,
        type: 'tagToPages',
      }));
    }

    // Removed relationships
    if (tagToPages.removed.length) {
      deletedRelationships = deletedRelationships.concat(tagToPages.removed);
    }

    if(addedRelationships.length == 0 && deletedRelationships.length == 0) {
      // There is nothing to update
      return Observable.of({status: 'No relationship'});
    }

    const requestBody = new UpdateRelationshipRequest(editingSession, this.nextOrder());
    requestBody.deletedRelationships = deletedRelationships;
    requestBody.addedRelationships = addedRelationships;
    return this.contentService.updateRelationship(requestBody);
  }

  public changePublishedToPage(page: any) {
    const { form: { publishOnBehalf, values } } = this.redux.getState();
    if(!page) {
      values.publishOnBehalf = undefined;
      publishOnBehalf.new = undefined;
      // Show error message
      this.formActions.updateFormControlByKey("publishOnBehalf", values.publishOnBehalf, {
          invalid: true,
          required: true
      });
      return;
    }

    // Has value
    if (publishOnBehalf.old && publishOnBehalf.old.entityId === page.entityId) {
      // Rollback then changes
      publishOnBehalf.new = undefined;
    } else {
      publishOnBehalf.new = page.entityId;
    }
    values.publishOnBehalf = page;
    // Mark publishOnBehalf as valid
    this.formActions.updateFormControlByKey('publishOnBehalf', values.publishOnBehalf, {});
    this.formActions.updateExtraField({publishOnBehalf});
  }

  public addTagToPages(page: any) {
    const { form: { tagToPages } } = this.redux.getState();
    tagToPages.push(page.entityId);
    this.formActions.updateExtraField({isFormChanged: true});
    this.formActions.updateExtraField({tagToPages});
  }

  public addInterestToContent(interest: any) {
    const { form: { values } } = this.redux.getState();
    if(!values.interests){
      values.interests = [];
    }
    values.interests.push(interest.id);
    this.formActions.updateFormControlByKey('interests', values.interests, {});
  }

  public removeInterest(interest: any) {
    const { form: { values } } = this.redux.getState();
    values.interests = values.interests.filter(id => id !== interest.id);
    this.formActions.updateFormControlByKey('interests', values.interests, {});
  }

  public removeTagToPages(page: any) {
    let { form: { tagToPages } } = this.redux.getState();
    tagToPages = tagToPages.filter(id => id !== page.entityId);
    this.formActions.updateExtraField({isFormChanged: true});
    this.formActions.updateExtraField({tagToPages});
  }

  public fetchPost(entityId: string): void {
      const defaultLevel = 4;
      this.contentService.fetchContent(entityId, defaultLevel)
              .map(result => {
                const post = this.convertContentDetailToView(result);
                this.initPostForm(post);
              })
              .subscribe()
  }

  public isChanged() : boolean {
    const { form: { isFormChanged, publishOnBehalf, tagToPages } } = this.redux.getState();
    return isFormChanged
      || (publishOnBehalf && publishOnBehalf.new);
  }

  public copyPost(postId: string): Observable<any> {
    const level = 4;
    return this.contentService.copyContent(postId, level)
                .map(result => {
                  const post = this.convertContentDetailToView(result.data);
                  this.initForm(result.editingSession, post, true, result.editingOrder);
                });
  }

  public updateParagraphValidity() {
    const { form: { values, isFormChanged }} = this.redux.getState();
    if(!values.publishOnBehalf) {
      this.formActions.updateFormControlByKey("publishOnBehalf", values.publishOnBehalf, {
          invalid: true,
          required: true
      });

      this.formActions.updateExtraField({
            isFormChanged
      });
    }
  }

  public isFormValid(): boolean {
    const { form: { errors } } = this.redux.getState();

    // Check required fields
    if(this.hasError(errors)) {
      return false;
    }

    // Check required fields in paragraph.
    if(errors && errors.paragraphs && this.hasError(errors.paragraphs[0])) {
      return false;
    }

    return true;
  }

  public resetForm() {
    this.formActions.resetForm();
  }

  private containRelationship(relationships: ContentRelationship[], entityId: string) {
    if(!relationships) return false;
    for (let i = 0; i < relationships.length; i++) {
      if (relationships[i].entityId === entityId) {
        return relationships[i];
      }
    }
    return false;
  }

  private transferParagraphToPost(post, tagToPages) {
    const entity: any = {}
    entity.type =post.paragraphs[0].type;
    entity.featureOnStream = post.featureOnStream;
    entity.language = post.language;
    entity.title = post.title;
    entity.label = post.label;
    entity.interests = post.interests;
    entity.publishOnBehalf = post.publishOnBehalf.entityId;
    entity.tagToPages = tagToPages;

    switch(entity.type) {
      case PARAGRAPH_TYPE.TEXT:
        const text = post.paragraphs[0] as ParagraphText;
        entity.description = text.description;
        break;
      case PARAGRAPH_TYPE.IMAGE:
        const imagePost = post.paragraphs[0] as ParagraphImagePost;
        entity.image = this.getImagePostPhoToAlbum(imagePost.image);
        break;
      case PARAGRAPH_TYPE.EMBEDDED:
      case PARAGRAPH_TYPE.LIVE:
        const embed = post.paragraphs[0] as ParagraphEmbeddedCode;
        entity.description = embed.description;
        entity.codeSnippet = embed.codeSnippet;
        entity.sourceName = embed.sourceName;
        break;
      default:
        break;
    }
    return entity;
  }

  private getImagePostPhoToAlbum(photoAlbum: PhotoAlbum){
    var images = photoAlbum.images.map((image: ImageInfo) => {
      const imageCloned = Object.assign({}, image);
      (imageCloned as any).tagToPages = imageCloned.tagToPages.map( tag => tag.entityId);
      return imageCloned;
    });

    return {
      "id": photoAlbum.id,
      "type":photoAlbum.type,
      "title": photoAlbum.title,
      "description": photoAlbum.description,
      "tagToPages": photoAlbum.tagToPages.map(e => e.entityId),
      "images": images
    }
  }

  private convertContentDetailToView(result: any): Post {
      let post = Post.convertFromEntity(result.entity) as Post;

      result.relatedEntities.forEach((entityRelationship) => {
          const { relationship, relatedEntity } = entityRelationship;
          ContentMapping.attachToPost(post, relationship.type, relatedEntity, relationship);
      });
      return post;
  }

  private initForm(editingSession: string, post, isChanged = false, editingOrder = 1) {
    this.formActions.initForm('post', post, {
      editingSession: editingSession,
      editingOrder: editingOrder,
      isFormChanged: isChanged,
      formGroupState: {},
      publishOnBehalf: {
        old: post.publishOnBehalf,
        new: undefined
      },
      tagToPages: post.tagToPages ? post.tagToPages.map( e => e.entityId) : []
    });
  }
}
