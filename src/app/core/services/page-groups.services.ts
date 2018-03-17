import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from 'ngx-webstorage';

import { getEndpoint } from 'configs';
import { PageInfoDetail } from 'features/pageGroups/page-detail.model';

/**
 * Manipulate all configs from server
 * PageService
 */

@Injectable()
export class PageGroupService {
    private endpoint: string = '/page-groups/';

    // TODO: update later when integrate page group service
    private getListPageGroupURL: string = 'get-list';
    private addPageInGroup: string = 'pages/relationship';
    private isHaveInfoComponentURL = 'is-have-info-component';
    private relativesEndpoint: string = 'relatives';

    constructor(
        private http: Http) {
        this.endpoint = getEndpoint(this.endpoint);
    }


    fetchPageGroupById(pageId: string): Observable<any> {
        return this.http.get(`${this.endpoint + pageId}`);
    }

    save(entity: any): Observable<any> {
        if (!entity.entityId) {
            return this.http.post(this.endpoint, entity);
        } else {
            return this.http.put(this.endpoint, entity);
        }
    }

    activatePageGroups(entityIds: Array<string>): Observable<any> {
        return this.http.put(`${this.endpoint}/activation`, {entityIds}).map(x=> x.json());;
    }

    getListPagesFromPageGroup(pageGroupId: string): Observable<any> {
        return this.http.get(`${this.endpoint}/${pageGroupId}/pages`);
    }

    addPageIntoPageGroup(listPageId: any[], groupId: string): Observable<any> {
        let pageParams = {pageIds: listPageId, pageGroupId: groupId};

        return this.http.post(this.endpoint + this.addPageInGroup, pageParams);
    }

    updatePageDefaultIntoPageGroup(relationshipId: string[], groupId: string): Observable<any> {
        return this.http.put(this.endpoint + groupId + '/relationships/' + relationshipId + '/default', null);
    }

    removePagesFromPageGroup(listPageId: any[], groupId: string): Observable<any> {
        let pageParams = {relationshipIds: listPageId};
        let param: RequestOptionsArgs;
        param  = {body: pageParams};
        return this.http.delete(`${this.endpoint}${groupId}/pages`, param);
    }

    movePagesFromPageGroup(listPages: PageInfoDetail[], groupId: string): Observable<any> {
        let pageParams = [];
        listPages.forEach(x=>pageParams.push({
                            'pageId':x.id,
                            'relationshipId':x.pageRelationshipId,
                            'order':x.relationshipOrder
                            }));
        let paramsObject = {pageOrderRelationships: pageParams};
        return this.http.put(`${this.endpoint}${groupId}/pages`, paramsObject);
    }

    suggestPageGroups(suggestionType: string, suggestionValue: string, pageGroupType: string): Observable<any> {
        return this.http.get(`${this.endpoint}suggestion?suggestionType=${suggestionType}&suggestionValue=${suggestionValue}&pageGroupType=${pageGroupType}`);
    }

    deleteRelatives(pageGroupIds: string[]){
      const params = { pageGroupIds };
      return this.http.delete(`${this.endpoint}${this.relativesEndpoint}`, { params });
    }

    isHaveInfoComponent(pageGroupId: string): Observable<any>{
      return this.http.get(`${this.endpoint}${pageGroupId}/${this.isHaveInfoComponentURL}`);
    }
}
