import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';

import { combineActionsToReducer, sortByOrder } from 'utils';

import {
    Content, Article, Post, RelationshipRequest, Paragraph, ParagraphImage,
    EntityRequest, ContentRelationship, UpdateRelationshipRequest,
    ContentMapping
} from 'models';

import { ContentService } from 'services';
import { NOTIFICATION_TYPE, VIEW_OPTIONS, PARAGRAPH_TYPE, FORM_STATE } from 'constant';

import { FormActions } from './form.state';
import { AlertsActions } from './alerts.state';
import { IContentState, IAppState, FormType, FormStatus } from './app-interfaces';


/**
 *
 *
 * @export
 * @class ContentActions
 */
@Injectable()
export class ContentActions {

    constructor(
        private redux: NgRedux<IAppState>,
        private alertsActions: AlertsActions,
        private formActions: FormActions,
        private contentService: ContentService
        ) { }

    private getArticle(): Article {
        const { form: { values } } = this.redux.getState();
        return <Article>values;
    }

    private getEntityId(): string {
        const { form: { entityId } } = this.redux.getState();
        return entityId;
    }
    private getEditingSession = () => this.redux.getState().form.editingSession;
    private getInQueues(): any[] {
        const { form: { inQueues } } = this.redux.getState();
        return inQueues ? inQueues : [];
    }

    private correctRelationshipType = (type: string) =>  type === 'paragraphs' ? 'paragraph' : type;

    private nextOrder = () => this.redux.getState().form['editingOrder'] + 1;

    cancelSession(): Observable<any> {
        return this.contentService
                    .cancelSession(this.getEditingSession());
    }

    /**
     * Request to BE then get Session
     *
     * {return}
     * @memberOf ContentActions
     */
    initSession(): Observable<any> {
        return this.contentService.initSession()
            .map(result=> {
                const { editingSession } = result;
                return editingSession;
            });
    }

    /**
     * Call commit request to save all changes.
     *
     * @returns {Observable<any>}
     *
     * @memberOf ContentActions
     */
    commit(showMessage: boolean = true): Observable<any> {
        return this.contentService
                .commit(this.getEditingSession())
                .map(result=> {
                    this.formActions.updateExtraField({
                        isSubmitted: false,
                        isFormChanged: false,
                        isSubmitting: false
                    });
                    if(showMessage){
                        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, 'Saved successfully');
                    }
                    return result;
                });
    }

    convertContentDetailToView(result: any): Content {
        let article = <Article> Article.convertFromEntity(result.entity);
        result.relatedEntities.forEach((entityRelationship) => {
            const { relationship, relatedEntity } = entityRelationship;
            ContentMapping.attachToArticle(article, relationship.type, relatedEntity, relationship);
        });
        return article;
    }
    /**
     * Fetch content by EntityId and Level,
     * Then request to Server to init a session for editing.
     *
     * @param {string} entityId
     * @returns
     *
     * @memberOf ContentActions
     */
    fetchArticle(entityId: string): void {
        //Level 4 = longest path  = Article -> Paragraph (type image) -> Image -> Tag To pages (of image)
        const defaultLevel = 4;
        this.contentService.fetchContent(entityId, defaultLevel)
                .map(result => {
                    this.initSession()
                        .subscribe(editingSession=> {
                            const article = this.convertContentDetailToView(result);
                            this.formActions.initForm('content',
                                article,
                                {
                                    entityId: article.entityId,
                                    editingSession: editingSession ,
                                    editingOrder: 1,
                                    inQueues: []
                                }
                            );
                        });
                })
                .subscribe()
    }

    /**
     *
     * Request a working session then init form.
     *
     * @memberOf ContentActions
     */
    initArticleForm(): void {
        this.initSession()
            .map(editingSession=> {
                const newArticle = new Article();
                this.formActions.initForm('content', newArticle, {
                    editingSession: editingSession ,
                    editingOrder: 1,
                    formGroupState: {
                        article_entity: FORM_STATE.INVALID
                    },
                    inQueues: []
                });
            })
            .subscribe();
    }

    saveParagraphEntity(isNew: boolean, entity: string | any): Observable<any> {
        let nextOrder = this.nextOrder();
        const entityRequest = new EntityRequest(this.getEditingSession(), nextOrder, 'paragraph');
        // Check for new case
        if(isNew) {
            entityRequest.data = entity;
            return this.contentService
                .createEntity(entityRequest)
                .map(result => {
                    const { entityId } = result;
                    const newParagraphEntity = { ...entity, entityId }
                    const article: Article = this.getArticle();

                    let { paragraphs } = article;
                    paragraphs = paragraphs ? paragraphs : [];
                    let newParagraphs = [];
                    if(!paragraphs) {
                        newParagraphs = [newParagraphEntity];
                    } else{
                        newParagraphs = [ ...paragraphs, newParagraphEntity ];
                    }
                    const {editingOrder} = result;
                    if(editingOrder){
                      nextOrder = editingOrder;
                    }
                    this.formActions.updateFormValueByKey('paragraphs', newParagraphs, {
                            editingOrder: ++nextOrder,
                            isFormChanged: true
                        });
                    const properties = { order: entity.order }
                    const articleId = this.getEntityId();
                    if(!articleId) {
                        this.addInQueue('paragraphs', newParagraphEntity);
                    } else{
                        this.createRelationship(articleId, 'paragraphs', newParagraphEntity, properties)
                            .subscribe();
                    }
                    return entityId;
                });
        } else {
            // Update exiting entity
            const article = this.getArticle();
            const paragraphEntity = article.paragraphs.filter((item) => item.entityId == entity);

            entityRequest.data = { ...paragraphEntity[0] };
            entityRequest.entityId = entity;
            return this.contentService
                .updateEntity(entityRequest)
                .map(result => {
                  const {editingOrder} = result;
                  if(editingOrder){
                    nextOrder = editingOrder;
                  }
                    this.formActions.updateExtraField({
                        editingOrder: ++nextOrder,
                        isFormChanged: true,
                        formGroupState: this.getCurrentFormGroupState(
                            `paragraph_${entity}`,
                            FORM_STATE.VALID)
                    });
                });
        }
    }

    updateOrderParagraph(firstEntity: any, secondEntity: any): void {
        const article: Article = this.getArticle();
        let nextOrder = this.nextOrder();
        const { paragraphs } = article;
        // FIXME: need to get correct relationshipIds then push to deleted
        let deletedRelationships = [];
        deletedRelationships.push(firstEntity.relationshipId);
        deletedRelationships.push(secondEntity.relationshipId);
        let addedRelationships = [];
        const articleId = this.getEntityId();
        addedRelationships.push({
            fromId: articleId,
            toId: firstEntity.entityId,
            type: 'paragraph',
            properties: {
                order: secondEntity.order
            }
        });
        addedRelationships.push({
            fromId: articleId,
            toId: secondEntity.entityId,
            type: 'paragraph',
            properties: {
                order: firstEntity.order
            }
        });

        paragraphs.forEach((item, idx) => {
            if(item.entityId == firstEntity.entityId) {
                item.order = secondEntity.order;
            }
            if(item.entityId == secondEntity.entityId) {
                item.order = firstEntity.order;
            }
        });

        if(!articleId) {
            let newChangeParagraphs = sortByOrder(paragraphs);
            this.formActions.updateFormValueByKey(
                    'paragraphs',
                    newChangeParagraphs, {isFormChanged: true});
            this.formActions.updateExtraField({inQueues: [] });
            newChangeParagraphs.forEach(x=>this.addInQueue('paragraphs', x));
            return ;
        }

        const requestBody = new UpdateRelationshipRequest(this.getEditingSession(), nextOrder);
        requestBody.deletedRelationships = deletedRelationships;
        requestBody.addedRelationships = addedRelationships;
        this.contentService
            .updateRelationship(requestBody)
            .map(data=> {
                const { entityIds: listEntityId } = data;
                paragraphs.forEach((item, idx) => {
                    if(item.entityId == firstEntity.entityId) {
                        item.relationshipId = listEntityId[0];
                    }
                    if(item.entityId == secondEntity.entityId) {
                        item.relationshipId = listEntityId[1];
                    }
                });
                this.formActions.updateFormValueByKey(
                    'paragraphs',
                    sortByOrder(paragraphs),
                    {
                        editingOrder: nextOrder,
                        isFormChanged: true
                    });
                    this.formActions.updateExtraField({
                      editingOrder: ++nextOrder,
                      isFormChanged: true
                  });
            })
            .subscribe();
    }

    updateOrderDrapDropParagraphs(drapIndex: number, dropIndex: number): void {
        const article: Article = this.getArticle();
        const nextOrder = this.nextOrder();
        const { paragraphs } = article;

        let addedRelationships = [];
        let deletedRelationships = [];
        const articleId = this.getEntityId();
        paragraphs.forEach((item, idx) => {
            let order: number = item.order;
            if(order >= dropIndex && order < drapIndex){
                item.order = order + 1;
            }
            if(order <= dropIndex && order > drapIndex){
                item.order = order - 1;
            }
            if(order == drapIndex){
                item.order = dropIndex;
            }
            addedRelationships.push({
                fromId: articleId,
                toId: item.entityId,
                type: 'paragraph',
                properties: {
                    order: item.order
                }
            });
            deletedRelationships.push(item.relationshipId);
        });

        if(!articleId) {
            let newChangeParagraphs = sortByOrder(paragraphs);
            this.formActions.updateFormValueByKey(
                    'paragraphs',
                    newChangeParagraphs, {isFormChanged: true});
            this.formActions.updateExtraField({inQueues: [] });
            newChangeParagraphs.forEach(x=>this.addInQueue('paragraphs', x));
            return ;
        }

        const requestBody = new UpdateRelationshipRequest(this.getEditingSession(), nextOrder);
        requestBody.deletedRelationships = deletedRelationships;
        requestBody.addedRelationships = addedRelationships;
        this.contentService
            .updateRelationship(requestBody)
            .map(data => {
                paragraphs.forEach((item, idx) => {
                    item.relationshipId = data.entityIds[idx];
                });
                this.formActions.updateFormValueByKey(
                    'paragraphs',
                    sortByOrder(paragraphs), {isFormChanged: true});
            })
            .subscribe();
    }

    /**
     * Save Entity depends on type.
     *
     * @param {string} [_entityId]
     * @returns {Observable<any>}
     *
     * @memberOf ContentActions
     */
    saveArticleEntity(): Observable<any> {
        //FIXME: should get data from store.
        const article = this.getArticle();
        const articleId = this.getEntityId();
        let nextOrder = this.nextOrder();
        const entityRequest = new EntityRequest(this.getEditingSession(), nextOrder, 'article');
        const entity = {
            description: article.description,
            featureOnStream: article.featureOnStream,
            label: article.label,
            language: article.language,
            paragraphViewOption: article.paragraphViewOption,
            title: article.title,
            articlePhoto: article.articlePhoto,
            interests: article.interests
        }
        entityRequest.data = entity;
        if (!articleId) {
            return this.contentService
                .createEntity(entityRequest)
                .map(result => {
                    const { entityId } = result;
                    const {editingOrder} = result;
                    if(editingOrder){
                      nextOrder = editingOrder;
                    }
                    this.formActions.updateExtraField({
                            editingOrder: nextOrder,
                            entityId,
                            formGroupState: this.getCurrentFormGroupState('article_entity', FORM_STATE.VALID)
                        });
                    this.patchRelationshipInQueue(entityId);
                });
        } else {
            entityRequest.entityId = articleId;
            return this.contentService
                .updateEntity(entityRequest)
                .map(result => {
                  const editingOrder = JSON.parse(result._body).editingOrder;
                  if(editingOrder){
                    nextOrder = editingOrder;
                  }
                    this.formActions.updateExtraField({
                        editingOrder: nextOrder,
                        formGroupState: this.getCurrentFormGroupState('article_entity', FORM_STATE.VALID)
                    });
                });
        }
    }

    validatePublishOnBehalf(data:any){
      if(!data) {
        this.formActions.updateFormStateByKey('publishOnBehalf', {
            required: true,
            invalid: true
        });
      }
    }

    updatePublishOnBehalfRelationship(data: any) {
        const articleId = this.getEntityId();
        const relationshipType = 'publishOnBehalf';
        const article = this.getArticle();
        if(!articleId) {
            // articleId is not created then add in queue
            const inQueues = this.getInQueues();
            let newQueues = [];
            if(!data || data === null) {
                // remove inQueues
                this.formActions.updateFormStateByKey(relationshipType, {
                    required: true,
                    invalid: true
                });
                newQueues = inQueues.filter((item) => item !== relationshipType);

            } else {
                let isHasPublishOnBehalf = false;
                newQueues = inQueues.map((item) => {
                    if(item.type === relationshipType) {
                        isHasPublishOnBehalf = true;
                        return {
                            type: relationshipType,
                            ...data
                        };
                    } else {
                        return { ...item };
                    }
                });
                if(!isHasPublishOnBehalf) {
                    newQueues.push({
                        type: relationshipType,
                        ...data
                    })
                }
                this.formActions.updateFormStateByKey(relationshipType, {
                    required: false,
                    invalid: false
                });
            }
            this.formActions.updateFormValueByKey(relationshipType, data, {
                inQueues: newQueues
            });
            return;
        }
        let nextOrder = this.nextOrder();
        const requestBody = new UpdateRelationshipRequest(this.getEditingSession(), ++nextOrder);
        if(article.publishOnBehalf && article.publishOnBehalf.relationshipId) {
            requestBody.deletedRelationships = [article.publishOnBehalf.relationshipId];
        }
        if(data && data !== null) {
            const {
                entityId: toId,
                parentPath
            } = data;
            const relationshipRequest = new RelationshipRequest(
                this.getEditingSession(),
                ++nextOrder,
                relationshipType,
                articleId,
                toId
            );
            requestBody.addedRelationships = [relationshipRequest];
        } else {
            this.formActions.updateFormValueByKey(relationshipType, undefined);
            this.formActions.updateFormStateByKey(relationshipType, {
                required: true,
                invalid: true
            });
        }
        if(requestBody.deletedRelationships || requestBody.addedRelationships) {
            this.contentService
                .updateRelationship(requestBody)
                .map(result=> {
                    const { entityIds: listEntityId } = result;
                    if(result && listEntityId.length > 0) {
                        this.updateRelationshipState(relationshipType, listEntityId[0], data);
                        this.formActions.updateFormStateByKey(relationshipType, {
                            required: false,
                            invalid: false
                        });
                    } else {
                        this.formActions.updateFormStateByKey(relationshipType, {
                            required: true,
                            invalid: true
                        });
                    }
                    this.formActions.updateExtraField({
                        editingOrder: ++nextOrder,
                        isFormChanged: true
                    });
                }).subscribe();
        }
    }

    removeInQueueByType(type: string) {
        const queues = this.getInQueues();
        const newQueues = queues.filter((item) => item.type !== type);
        this.formActions.updateExtraField({
            inQueues: newQueues
        });
    }

    createRelationship(
        entityId: string, relationshipType: string,
        data: any, properties?: any): Observable<any>
    {

        let nextOrder = this.nextOrder();
        const {
            entityId: toId,
            parentPath
        } = data;

        const relationshipRequest = new RelationshipRequest(
            this.getEditingSession(),
            ++nextOrder,
            this.correctRelationshipType(relationshipType),
            entityId,
            toId
        );

        if (properties) relationshipRequest.properties = properties;
        return this.contentService
            .createRelationShip(relationshipRequest)
            .map(result=> {
                const { entityId: relationshipId } = result;
                this.updateRelationshipState(relationshipType, relationshipId, data);
                const {editingOrder} = result;
                if(editingOrder){
                  nextOrder = editingOrder;
                }
                this.formActions.updateExtraField({
                    editingOrder: ++nextOrder,
                    isFormChanged: true
                });
                return relationshipId;
            });
    }

        /**
     * Save a Paragraph Entity.
     * Check if exists then create or update paragraph entity
     *
     * @param {string} type
     * @param {string} relationshipId
     * @returns {Observable<any>}
     *
     * @memberOf ContentActions
     */
    updateRelationshipState(relationshipType: string, relationshipId: string, data: any): void {
        const { entityId, displayName, parentPath, idx } = data;
        const contentRelationship = new ContentRelationship(relationshipId, entityId, displayName);
        const article: Article = this.getArticle();
        switch (relationshipType) {
            case 'publishOnBehalf':
                this.formActions.updateFormValueByKey(
                    relationshipType,
                    contentRelationship
                    );
                break;
            case 'paragraphs':
                const { paragraphs } = article;
                const newParagraphs = paragraphs.map((item) => {
                    if(item.entityId == entityId)
                    {
                        item.relationshipId = relationshipId;
                    }
                    return item;
                });
                this.formActions.updateFormValueByKey(relationshipType, newParagraphs);
                break;
            case 'tagToPages':
            default:
                if(parentPath === 'paragraphs') {
                    const { paragraphs } = article;
                    const newParagraphs = paragraphs.map((item, index) => {
                        if(index === idx && item.type == PARAGRAPH_TYPE.IMAGE) {
                            let newItem = <ParagraphImage>item;
                            newItem.tagToPages = newItem.tagToPages ? newItem.tagToPages : [];
                            newItem.tagToPages.push(contentRelationship);
                            return newItem;
                        }
                        return item;
                    });
                    this.formActions.updateFormValueByKey('paragraphs', newParagraphs);
                } else {
                    let tagToPages = article.tagToPages ? article.tagToPages : [];
                    let newTag2Pages = [];
                    if(tagToPages.length === 0) {
                        newTag2Pages.push(contentRelationship);
                    } else {
                        let isExists = false;
                        newTag2Pages = tagToPages.map((item) => {
                            if(item.entityId == entityId) {
                                isExists = true;
                                return contentRelationship;
                            } else {
                                return {
                                    ...item
                                }
                            }
                        });
                        if(!isExists) newTag2Pages.push(contentRelationship);
                    }
                    this.formActions.updateFormValueByKey(relationshipType, newTag2Pages);
                }
                break;
        }
    }

    patchRelationshipInQueue(fromId: string): void {
        const inQueues = this.getInQueues();
        let nextOrder = this.nextOrder();
        if(inQueues.length === 0) return;

        let addedRelationships = [];

        inQueues.forEach((item) => {
            const { entityId: toId, type, order } = item;
            addedRelationships.push({
                fromId,
                toId,
                type,
                properties: { order }
            });
        });
        const requestBody = new UpdateRelationshipRequest(this.getEditingSession(), ++nextOrder);
        requestBody.deletedRelationships = [];
        requestBody.addedRelationships = addedRelationships;
        this.contentService
            .updateRelationship(requestBody)
            .map(data=> {
                const { entityIds: listEntityId } = data;
                inQueues.forEach((item, idx) => {
                    const { entityId: toId, type } = item;
                    this.updateRelationshipState(type == 'paragraph' ? 'paragraphs': type, listEntityId[idx], item);
                });
                this.formActions.updateExtraField({ editingOrder: ++nextOrder, inQueues: [] });
            })
            .subscribe();
    }

    /**
     * If the article was not created then add all requests to queue for later call.
     *
     * @param {string} type
     * @param {object} data
     * @param {boolean} isArray
     *
     * @memberOf ContentActions
     */
    addInQueue(type: string, data: object, parentPath: string[] = []): void {
        const newItem = {
            ...data,
            parentPath,
            type: type == 'paragraphs' ? 'paragraph': type
        };
        const inQueues = this.getInQueues();
        const newQueues = [
            ...inQueues,
            newItem
        ];
        this.updateRelationshipState(type, '', data);
        this.formActions.updateExtraField({ inQueues: newQueues });
    }

    removeParagraph(idx: number): Observable<any> {
        const article: Article = this.getArticle();
        const { paragraphs } = article;
        // Get & remove relationship
        const removeItem = paragraphs[idx];
        let requests = [
            this.contentService.deleteEntity(
                removeItem.entityId,
                this.nextOrder(),
                this.getEditingSession())
        ];
        let newQueues = [];
        if(removeItem.relationshipId) {
           requests.push(
               this.contentService.deleteRelationShip(
                   removeItem.relationshipId,
                   this.nextOrder(),
                   this.getEditingSession()));
        } else {
            // remove inQueues
            const inQueues = this.getInQueues();
            newQueues = inQueues.filter((item)=> item.entityId !== removeItem.entityId);
        }
        return Observable.forkJoin(requests)
            .map(data => {

                //reset order
                paragraphs.forEach((item, i) => {
                   if(i > idx){
                       item.order = item.order - 1;
                   }
                });
                // Update state.
                const newParagraphs = [
                    ...paragraphs.slice(0, idx),
                    ...paragraphs.slice(idx + 1, paragraphs.length)
                ];
                this.formActions.updateFormValueByKey('paragraphs', newParagraphs,
                {
                    formGroupState: this.getCurrentFormGroupState(`paragraph_${removeItem.entityId}`, 'VALID'),
                    isFormChanged: true
                });
                if(!removeItem.relationshipId) {
                    this.formActions.updateExtraField({
                        inQueues: newQueues,
                        isFormChanged: true
                    });
                }

            });
    }

    removeTag2PageOfParagraph(data: any, idx: number) {
        this.removeTagToPageRelationship(data, 'paragraphs', idx)
    }

    removeTag2PageOfArticle(data: any){
        this.removeTagToPageRelationship(data);
    }

    private removeTagToPageRelationship(data: any, parentPath?: string, idx?: number): void {
        const { relationshipId } = data;
        if(relationshipId) {
            this.contentService
                .deleteRelationShip(relationshipId, this.nextOrder(), this.getEditingSession())
                .map(x=> {
                    const article = <Article>this.getArticle();
                    if(parentPath) {
                        // for tagToPages in paragraphs field.
                        const { paragraphs } = article;
                        const newParagraph = paragraphs.map((item, index) => {
                            const newItem = { ...item };
                            if(item.type === PARAGRAPH_TYPE.IMAGE) {
                                let imageParagraph = <ParagraphImage>newItem;
                                imageParagraph.tagToPages =
                                    imageParagraph.tagToPages.filter((cur) => cur.relationshipId !== relationshipId);
                                    return imageParagraph;
                            }
                            return newItem;
                        });
                        this.formActions.updateFormValueByKey(parentPath, newParagraph);
                    } else {
                        const relationships: any[] = article.tagToPages;
                        const newTagToPages =
                                relationships.filter((cur) => cur.relationshipId !== relationshipId);
                        this.formActions.updateFormValueByKey('tagToPages', newTagToPages);
                    }
                })
                .subscribe();
        } else {
            // remove in queue
            const inQueues = this.getInQueues();
            // const articleTagToPage
            const { parentPath } = data;
            if(parentPath === 'paragraphs') {
                this.removeTag2PageInParagraph(idx, data);
            } else {
                this.removeTag2PageInArticle(data);
            }
            const newQueues = inQueues.filter((item)=> item.entityId !== data.entityId);
            this.formActions.updateExtraField({ inQueues: newQueues });
        }
    }

    removeTag2PageInArticle(data: any) {
        const article = this.getArticle();
        const newTag2Pages = article.tagToPages.filter((page, index) => page.entityId !== data.entityId);
        this.formActions.updateFormValueByKey('tagToPages', newTag2Pages);
    }

    removeTag2PageInParagraph(paragraphIdx: number, page: any) {
        const { paragraphs } = this.getArticle();
        if(paragraphs && paragraphs.length > 0) {
            const { entityId } = page;
            const newParagraph = paragraphs.map((item, index) => {
                const newItem = { ...item };
                if(item.type === PARAGRAPH_TYPE.IMAGE) {
                    let imageParagraph = <ParagraphImage>newItem;
                    imageParagraph.tagToPages =
                        imageParagraph.tagToPages.filter((curentPage) => curentPage.entityId !== entityId);
                        return imageParagraph;
                }
                return newItem;
            });
            this.formActions.updateFormValueByKey('paragraphs', newParagraph);
        }
    }

    checkExistContentTitle(value: string, formGroupStateKey?: string): Observable<any> {
        const fieldName = 'data.title';
        return this.contentService.checkExist(fieldName, value)
            .map(result => {
                const { result: isMatch  } = result;
                let controlState = null;
                if(isMatch) {
                    controlState = { existsTitle: isMatch };
                }
                this.formActions.updateFormControlByKey('title', value, controlState);
                this.formActions.updateExtraField({
                    formGroupState: this.getCurrentFormGroupState(formGroupStateKey,
                        isMatch ? FORM_STATE.INVALID : FORM_STATE.VALID)
                });
                return isMatch;
            });
    }

    updateFormGroupStatus(formGroupType: string, formStatus: string) {
        if(this.redux.getState().form.isFormChanged) {
            const status = formStatus as FormStatus;
            this.formActions.updateExtraField({
                formGroupState: this.getCurrentFormGroupState(formGroupType, formStatus),
                isFormChanged: true
            });
        }
    }

    allFormValid(): boolean {
        const { form: { formGroupState } } = this.redux.getState();
        let isAllValid = true;
        if(formGroupState) {
            const listFormInvalid = Object.keys(formGroupState)
                    .filter((state) => formGroupState[state] === FORM_STATE.INVALID);

            if(listFormInvalid && listFormInvalid.length > 0) isAllValid = false;
        }
        return isAllValid;
    }

    getCurrentFormGroupState(formGroupType: string, formStatus: string) {
        const { form: { formGroupState } } = this.redux.getState();
        return {
            ...formGroupState,
            [formGroupType]: formStatus
        }
    }

    copyArticle(entityId: string): Observable<any> {
        if(!entityId) return;
        return this.contentService.copyContent(entityId, 4)
            .map(result => {
                const { editingSession, editingOrder, data: { entity } } = result;
                let newArticle = this.convertContentDetailToView(result.data);
                this.formActions.initForm('content',
                    newArticle,
                    {
                        editingSession,
                        entityId: newArticle.entityId,
                        isFormChanged: true,
                        formGroupState: {
                            article_entity: FORM_STATE.VALID
                        },
                        editingOrder,
                        inQueues: []
                    }
                );
                return entity.entityId;
            });
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

    beforeSubmitForm(isSubmitting: boolean): void {
        this.formActions.updateExtraField({
            isSubmitting
        });
    }

    resetForm() {
        this.formActions.resetForm();
    }
};
