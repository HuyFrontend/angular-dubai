import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from 'ngx-webstorage';

import { getEndpoint } from 'configs';
import { Campaign, SearchCriteria } from 'models';
/**
 * Manipulate all configs from server
 * CampaignService
 */

@Injectable()
export class CampaignService {

  private endpoint: string = '/campaigns';

  constructor(
    private http: Http,
    private localStorageService: LocalStorageService) {
    this.endpoint = getEndpoint(this.endpoint);
  }

  saveCampaign(campaign: Campaign): Observable<any>{
    const campaignReq: Campaign = campaign;
    return this.http.post(`${this.endpoint}`, campaignReq);
  }

  updateCampaign(campaign: Campaign): Observable<any>{
    const campaignReq: Campaign = campaign;
    return this.http.put(`${this.endpoint}`, campaignReq);
  }

  saveOrUpdateCampaign(campaign: Campaign): Observable<any> {
    const campaignReq: Campaign = campaign;
    if (campaignReq.id) {
      return this.updateCampaign(campaignReq);
    } else {
      return this.saveCampaign(campaignReq);
    }
  }

  deleteCampaign(campaignId: String): Observable<any>{
    return this.http.delete(`${this.endpoint}/${campaignId}`);
  }

  getCampaignById(campaignId: String): Observable<any>{
    return this.http.get(`${this.endpoint}/${campaignId}`);
  }

  getCampaigns(searchCriteria: SearchCriteria): Observable<any>{
    const params = [
      `searchField=${searchCriteria.field}`,
      `keywords=${searchCriteria.keywords.join()}`,
      `orderBy=${searchCriteria.orderBy}`,
      `orderDir=${searchCriteria.orderDir}`,
      `pageOffset=${searchCriteria.page}`,
      `pageSize=${searchCriteria.pageSize}`,
      `quickSearchValue=${encodeURIComponent(searchCriteria.quickSearchValue)}`,
      `fromDate=${searchCriteria.fromDate}`,
      `toDate=${searchCriteria.toDate}`
    ];
    return this.http.get(`${this.endpoint}?${params.join('&')}`);
  }

  publishCampaign(campaignId: String): Observable<any>{
    return this.http.post(`${this.endpoint}/${campaignId}.publish`, {});
  }

  publishAndSaveCampaign(campaign: Campaign): Observable<any>{
    const campaignReq: Campaign = campaign;
    return this.http.post(`${this.endpoint}.publish`, campaignReq);
  }

  unpublishCampaign(campaignId: String): Observable<any>{
    return this.http.post(`${this.endpoint}/${campaignId}.unpublish`, {});
  }

  cancelCampaign(campaignId: String): Observable<any>{
    return this.http.post(`${this.endpoint}/${campaignId}.cancel`, {});
  }

  deleteBulk(bulkIds: Array<String>): Observable<any>{
    const req = { ids: bulkIds}
    return this.http.delete(`${this.endpoint}/bulk.delete`, { body: req });
  }

  publishBulk(campaigns: Array<Campaign>): Observable<any>{
    return this.http.post(`${this.endpoint}/bulk.publish`, campaigns);
  }

  unpublishBulk(bulkIds: Array<String>): Observable<any>{
    const req = { ids: bulkIds}
    return this.http.post(`${this.endpoint}/bulk.unpublish`, req);
  }

  cancelBulk(bulkIds: Array<String>): Observable<any>{
    const req = { ids: bulkIds}
    return this.http.post(`${this.endpoint}/bulk.cancel`, req);
  }

  checkUniqueCampaignName(campaignName: String): Observable<any>{
    return this.http.get(`${this.endpoint}/exist?name=${campaignName}`);
  }
}
