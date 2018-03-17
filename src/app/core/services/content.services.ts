import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';


import { getEndpoint } from 'configs';
import { RelationshipRequest, EntityRequest, UpdateRelationshipRequest } from 'models';

/**
 * Manipulate requests related to content service.
 * ContentService
 */

@Injectable()
export class ContentService {
    private endpoint: string = '/content/';

    constructor(
        private http: Http) {
        this.endpoint = getEndpoint(this.endpoint);
    }

    /**
     * Create Session for every add new content.
     *
     * @returns {Observable<any>}
     *
     * @memberOf ContentService
     */
    initSession(): Observable<any> {
        return this.http.post(`${this.endpoint}sessions`, {});
    }

    /**
     * Save content with patch information with correctponding data in session
     *
     * @param {string} editingSession
     * @returns
     *
     * @memberOf ContentService
     */
    commit(editingSession: string) {
        return this.http.put(`${this.endpoint}sessions?editingSession=${editingSession}`, {});
    }

    /**
     * Delete all data belong to the editingSession.
     *
     * @param {string} editingSession
     */
    cancelSession(editingSession: string) {
        return this.http.delete(`${this.endpoint}sessions?editingSession=${editingSession}`, {});
    }

    /**
     * Create an entity type.
     *
     * @param {EntityRequest} entity
     * @returns {Observable<any>}
     *
     * @memberOf ContentService
     */
    createEntity(entity: EntityRequest): Observable<any> {
        return this.http.post(`${this.endpoint}entities`, entity);
    }

    updateEntity(entity: EntityRequest): Observable<any> {
        return this.http.put(`${this.endpoint}entities`, entity);
    }

    createOrUpdateApp(entity: EntityRequest): Observable<any> {
        if (entity.entityId)
          return this.updateApp(entity);
        else
          return this.createApp(entity);
    }

    deleteEntity(entityId: string, order: number, session: string) {
        return this.http.delete(`${this.endpoint}entities/${entityId}/${order}/${session}`);
    }

    createRelationShip(relationship: RelationshipRequest): Observable<any> {
        return this.http.post(`${this.endpoint}relationships`, relationship);
    }

    updateRelationship(requestBody: UpdateRelationshipRequest): Observable<any> {
        return this.http.put(`${this.endpoint}relationships`, requestBody)
                .map(x=> x.json());
    }

    deleteRelationShip(relationshipId: string, order: number, session: string): Observable<any> {
        return this.http.delete(`${this.endpoint}relationships/${relationshipId}/${order}/${session}`);
    }

    checkExist(fieldName: string, value: string): Observable<any> {
        const valueDecode = encodeURIComponent(value.trim());
        return this.http.get(`${this.endpoint}entities/exist?field=${fieldName}&value=${valueDecode}`);
    }

    /**
     * Fetch Content by EntityId and Level.
     * Document at:
     * http://dev-api-load-balancer-1115137683.us-east-1.elb.amazonaws.com/content/api-docs/index.html
     * #resources-validate_shouldGetEntityRelativesById
     *
     * @param {string} entityId
     * @param {number} [level=1]
     * @returns
     *
     * @memberOf ContentService
     */

    fetchContent(entityId: string, level: number = 1): Observable<any> {
        return this.http.get(`${this.endpoint}entities/${entityId}/relatives?level=${level}`);
    }

    fetchContentByIds(entityIds: string[], level: number = 1): Observable<any> {
        var inCriteria = {inCriteria: {_id: entityIds}};
        return this.queryContent(inCriteria);
    }

    fetchContentAndRelativesByIds(entityIds: string[], level: number = 1): Observable<any> {
        var criteria =  {ids: entityIds};
        return this.http.post(`${this.endpoint}entities/page-relatives.query`, criteria);
    }

    queryContent(inCriteria: any): Observable<any> {
        return this.http.post(`${this.endpoint}entities/query/`, inCriteria);
    }

    suggestContent(suggestValue: string, suggestionType: string, excludedIds: string[]): Observable<any> {
        var searchCriteria = {
                suggestValue,
                suggestionType,
                excludedIds,
                limit: 10
            };
        return this.http.post(`${this.endpoint}suggestion/`, searchCriteria);
    }

    /**
     * Request to server to copy a content with entityId and level.
     *
     *
     * @param {string} entityId
     * @param {number} [level=3]
     * @returns {Observable<any>}
     *
     * @memberOf ContentService
     */
    copyContent(entityId: string, level: number = 3): Observable<any> {
        return this.http.post(`${this.endpoint}entities/${entityId}/copy?level=${level}`, {});
    }

    /**
     * Create Post entity
     * @param entity post entity
     */
    createPost(post: any): Observable<any> {
        return this.http.post(`${this.endpoint}post`, post);
    }

    /**
     * Create Post entity
     * @param entity post entity
     */
    updatePost(post: any): Observable<any> {
        return this.http.put(`${this.endpoint}post`, post);
    }

    /**
     * Create App entity
     * @param entity app entity
     */
    createApp(app: any): Observable<any> {
        return this.http.post(`${this.endpoint}app`, app);
    }

    /**
     * Create App entity
     * @param entity app entity
     */
    updateApp(app: any): Observable<any> {
        return this.http.put(`${this.endpoint}app`, app);
    }

    getPageFromPageNames(pageNames:string): Observable<any> {
      let uniquePageNames = [];
      if (pageNames) {
        uniquePageNames = pageNames.split(',');
      }
      return this.http.post(`${this.endpoint}/pages`, uniquePageNames);
    }
}
