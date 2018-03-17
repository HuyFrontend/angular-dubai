import { PAGE_METADATA_FIELD } from '../constant';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from 'ngx-webstorage';

import { getEndpoint } from 'configs';
import { PageModel, SearchCriteria, PageSuggestionRequest } from 'models';
/**
 * Manipulate all configs from server
 * PageService
 */

@Injectable()
export class PageService {
  private searchPagesEndpoint: string = '/content/entities/'
  private publishEndpoint: string = '/pages/activation/'
  private endpoint: string = '/pages/';
  private suggestionEndpoint: string = '/pages/suggestion';
  private metadataSuggestionEndpoint: string = '/pages/metadata/suggestion';
  private relativesEndpoint: string = '/pages/relatives';

  constructor(
    private http: Http,
    private localStorageService: LocalStorageService) {
    this.endpoint = getEndpoint(this.endpoint);
  }

  searchPages(searchCriteria: SearchCriteria): Observable<Response> {
    const params = [
    `types=${searchCriteria.type}`,
    `searchField=${searchCriteria.field}`,
    `keywords=${searchCriteria.keywords.join()}`,
    `quickSearchValue=${encodeURIComponent(searchCriteria.quickSearchValue)}`,
    `fromDate=${searchCriteria.fromDate}`,
    `toDate=${searchCriteria.toDate}`,
    `orderBy=${searchCriteria.orderBy}`,
    `orderDir=${searchCriteria.orderDir}`,
    `page=${searchCriteria.page}`,
    `size=${searchCriteria.pageSize}`
    ];
    let url = getEndpoint(`${this.searchPagesEndpoint}?${params.join('&')}`);
    return this.http.get(url);
    }

  fetchPageById(pageId: string): Observable<any> {
    return this.http.get(`${this.endpoint + pageId}`);
  }

  fetchPageByIds(entityIds: string[], level: number = 1): Observable<any> {
    var inCriteria = {inCriteria: {_id: entityIds}};
    return this.queryPage(inCriteria);
  }

  queryPage(inCriteria: any): Observable<any> {
      return this.http.post(getEndpoint(`${this.searchPagesEndpoint}query/`), inCriteria);
  }


  save(entity: any): Observable<any> {
    if (!entity.entityId) {
      // create
      return this.http.post(this.endpoint, entity);
    } else {
      // update
      return this.http.put(this.endpoint, entity);
    }
  }

  publishPage(pageIds: Array<string>) {
    let url = getEndpoint(this.publishEndpoint);
    const pages = {entityIds : pageIds}
    return this.http.put(url, pages).map(x=> x.json());
  }


  /**
   * Query pages by parameters.
   *
   * @param {string} type: page field need to search
   * @param {string} val: value
   * @returns
   *
   * @memberOf PageService
   */
  suggest(request: PageSuggestionRequest): Observable<any> {
    const queryURL: string = `${getEndpoint(this.suggestionEndpoint)}`;

    return this.http.post(queryURL, request);
  }

  suggestPageMetadata(suggestionValue: string, pageType: string, pageSubType:string){
    const params = { suggestionValue, pageType, pageSubType};
    return this.http.post(`${getEndpoint(this.metadataSuggestionEndpoint)}`, params)
        //TODO add mapping for metadata name from code here
        //Dummy map here
        .map((elem: any) =>{
          return elem.metadataFields.map(fieldCode => ({code: fieldCode, text: this.getMetadataText(fieldCode) } ));
        })
  }

  getMetadataText(metadataCode: string): string{
    const code = metadataCode.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
    return PAGE_METADATA_FIELD[code.toUpperCase()];
  }

  deleteRelatives(pageIds: string[]){
    const params = { pageIds };
    return this.http.delete(`${getEndpoint(this.relativesEndpoint)}`, { params });
  }
}
