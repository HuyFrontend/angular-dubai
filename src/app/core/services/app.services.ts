import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from 'ngx-webstorage';

import { getEndpoint } from 'configs';
import { Campaign, EntityRequest } from 'models';
/**
 * Manipulate all configs from server
 * CampaignService
 */

@Injectable()
export class AppService {
  private searchPagesEndpoint: string = '/content/entities/'
  private contentEndpoint: string = '/content/';

  constructor(
    private http: Http,
    private localStorageService: LocalStorageService) {
    this.searchPagesEndpoint = getEndpoint(this.searchPagesEndpoint);
    this.contentEndpoint = getEndpoint(this.contentEndpoint);
  }

  getApps(field: string,
              keywords: string,
              quickSearchValue: string,
              fromDate: string,
              toDate: string,
              orderBy: string,
              orderDir: string,
              page: number,
              pageSize: number): Observable<any>{
    const params = [
      `types=app`,
      `searchField=${field}`,
      `keywords=${keywords}`,
      `quickSearchValue=${quickSearchValue}`,
      `fromDate=${fromDate}`,
      `toDate=${toDate}`,
      `orderBy=${orderBy}`,
      `orderDir=${orderDir}`,
      `page=${page}`,
      `size=${pageSize}`
    ];
    return this.http.get(this.searchPagesEndpoint + `?${params.join('&')}`);
  }

  createApp(entity: any): Observable<any> {
      return this.http.post(`${this.contentEndpoint}post`, entity);
    }

  checkAppExist(fieldName: string, value: string): Observable<any> {
        const valueDecode = encodeURIComponent(value.trim());
        return this.http.get(`${this.contentEndpoint}entities/exist?field=${fieldName}&type=app&value=${valueDecode}`);
    }
}
