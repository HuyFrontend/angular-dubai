import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { storageConfigs } from 'configs';

@Injectable()
export class PageSubTypeService {

  constructor(private localStorageService: LocalStorageService) { }

  getDataFromCache(dataName: string, cachePageConfigs: any): Observable<any[]> {
    return new Observable(observer => {
      let data = [];
      if (cachePageConfigs) {
        data = cachePageConfigs[dataName];
        observer.next(data);
      } else {
        this.localStorageService
          .observe(storageConfigs.page)
          .subscribe(cacheData => {
            if (cacheData[dataName]) {
              data = cacheData[dataName];
            }
            observer.next(data);
          });
      }
    });
  }
}
