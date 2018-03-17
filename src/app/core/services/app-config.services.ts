import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from 'ngx-webstorage';

import { getEndpoint, storageConfigs } from 'configs';
/**
 * Manipulate all configs from server
 * AppConfigService
 */

@Injectable()
export class AppConfigService {

    private endpoint: string = '/configs/lists';
    private keyInterest = 'INTEREST';

    constructor(
        private http: Http,
        private localStorageService: LocalStorageService) {
        this.endpoint = getEndpoint(this.endpoint);
    }

    /**
     * Get & check exists config key.
     *
     * @param {string} key
     * @returns {boolean}
     * {true} if its exists
     * {false} if it doest not exists.
     *
     * @memberOf AppConfigService
     */
    checkExitsKey(key: string): boolean {
        if(!key) return false;

        const appConfigs = this.localStorageService.retrieve(key);
        if(appConfigs) return true;
        return false;
    }

    /**
     *
     *
     * @param {string} countryCode
     * @param {string} [lang]
     * @returns {Observable<Response>}
     *
     * @memberOf AppConfigService
     */
    fetchCitiesByCountryCode(countryCode: string, lang: string = 'en'): Observable<any> {
      if(countryCode && typeof countryCode == 'string' && countryCode.trim()) {
        return this.http.get(`${this.endpoint}/countries/${countryCode}/cities?langs=${lang}`)
            .map((result: any) => {
                return result;
            });
      }
      return Observable.of([]);
    }

    fetchSubGenreByGenreCode(genreCode: string, lang: string = 'en'): Observable<any> {
      if (genreCode) {
        const queryString = `${this.endpoint}/genres/${genreCode}/subgenres?langs=${lang}`;
        return this.http.get(queryString).map((result: any) => result);
      }
      return Observable.of([]);
    }


    fetchCampaignConfigs(lang: string = 'en'): Observable<any> {
        const queryString = `${this.endpoint}/campaign/results?langs=${lang}`;
        return this.http.get(queryString).map((result: any) => result);
    }

    fetchInterestConfigs(lang: string = 'en'): Observable<any> {
      if (this.checkExitsKey(this.keyInterest)) {
        return Observable.of(this.localStorageService.retrieve(this.keyInterest));
      } else {
        const queryString = `${this.endpoint}/interests?langs=${lang}`;
        return this.http.get(queryString).map((result:any) => {
            this.localStorageService.store(this.keyInterest, result);
            return result;
        });
      }
    }

    /**
     * Check exists {configKey} then fetch/store if it not avaiable.
     *
     * @param {string} configKey
     * @param {string[]} types
     * @param {string} [lang='en']
     * @returns {Observable<Response>}
     *
     * @memberOf AppConfigService
     */
    fetchConfigByTypes(configKey: string, types:string[], lang: string = 'en'): Observable<Response> {
      if (this.checkExitsKey(configKey)) {
        return Observable.of(this.localStorageService.retrieve(configKey));
      } else {
        return this.http.get(`${this.endpoint}/?types=${types.toString()}&langs=${lang}`)
        .map((result:any) => {
          if(!this.checkExitsKey(configKey)) {
            this.localStorageService.store(configKey, result);
          }
          return result;
        });
      }
    }

    suggestCity (value: string): Observable<any> {
      var lang = 'en';
      return this.http.get(`${this.endpoint}/countries/cities/suggestion?value=${value}&langs=${lang}`);
    }
}
