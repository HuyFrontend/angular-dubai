import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { storageConfigs } from 'configs';

@Injectable()
export class PageTypeService {

  constructor(private localStorageService: LocalStorageService) { }

  /**
   * Get page type name from local storage service
   *
   * @param pageType
   */
  getPageTypeName(pageType: string): any {
    const pageConfigs = this.localStorageService.retrieve(storageConfigs.page);
    const listPageType = pageConfigs['pageTypes'];
    for (let pType of listPageType) {
      if (pageType === pType.code) {
        return pType.names;
      }
    }
    return null;
  }

  getSubTypeList(pageType: string, cachePageConfigs: any): Observable<any[]> {
    return new Observable(observer => {
      let listSubType = [],
          dataName = `${pageType}SubTypes`;
      if (cachePageConfigs && cachePageConfigs !== null) {
        listSubType = cachePageConfigs[dataName];
        observer.next(listSubType);
      } else {
        this.localStorageService
          .observe(storageConfigs.page)
          .subscribe(cacheData => {
            if (cacheData[dataName]) {
              listSubType = cacheData[dataName];
            }
            observer.next(listSubType);
          });
      }
    });
  }
}
