import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { combineActionsToReducer } from 'utils';
import { AlertsActions } from './alerts.state';
import { IAppState } from './app-interfaces';
import { FORM_CHANGED } from './redux-form.state';
import { App } from 'models/app.model';
import { ContentService } from "services";
import { AppInfo, AppOptions } from "models/app";
import { ContentRelationship, ImageInfo } from "models";

const FETCH_APP_BY_ID_ACTION: string = 'PAGE_STATE/FETCH_APP_BY_ID_ACTION';
const RESET_APP_ACTION: string = 'PAGE_STATE/RESET_APP_ACTION';
const UPDATE_APP_ACTION: string = 'PAGE_STATE/UPDATE_APP_ACTION';

@Injectable()
export class AppActions {
  constructor(
    private redux: NgRedux<IAppState>,
    private alertsActions: AlertsActions,
    private contentService: ContentService
  ) {

  }

  fetchAppById(appId: string) {
    const defaultLevel = 4;
    this.contentService.fetchContent(appId, defaultLevel)
      .subscribe(result => {
        const app = this.convertEntityToView(result);
        this.redux.dispatch({ type: FETCH_APP_BY_ID_ACTION, payload: { app: { ...app } } });
      })
  }

  convertEntityToView(result: any) : App {
    let tempAppInfo = new AppInfo();
    tempAppInfo.id = result.entity.entityId;
    tempAppInfo.status = result.entity.status;
    tempAppInfo.publishedDateTime = result.entity.publishedDate;
    tempAppInfo.createdDateTime = result.entity.createdDate;
    tempAppInfo.title = result.entity.data.title;
    tempAppInfo.interests = result.entity.data.interests;
    tempAppInfo.tagToPages = this.getTagtoPagesRelationship(result);
    tempAppInfo.type = result.entity.data.type;
    tempAppInfo.description = result.entity.data.description;
    tempAppInfo.publishOnBehalf = this.getPublishOnBehalfRelationship(result);

    let tempAppOptions = new AppOptions();
    tempAppOptions.code = result.entity.data.code;
    tempAppOptions.link = result.entity.data.link;

    let tempApp = new App();
    tempApp.generalType = result.entity.type;
    tempApp.info = tempAppInfo;
    tempApp.options = tempAppOptions;
    tempApp.photo = this.getImageRelationship(result);

    return tempApp;
  }

  getPublishOnBehalfRelationship(result: any): ContentRelationship {
    if (result.relatedEntities) {
      const publishOnBehalfEntity = result.relatedEntities.filter(relatedEntity =>
        relatedEntity.relationship.type === "publishOnBehalf"
      )[0];
    return new ContentRelationship(publishOnBehalfEntity.relationship.entityId, publishOnBehalfEntity.relatedEntity.entity.entityId, publishOnBehalfEntity.relatedEntity.entity.data.info.internalUniquePageName);
    } else {
      return new ContentRelationship("", "", "");
    }
  }

  getTagtoPagesRelationship(result: any): ContentRelationship[] {
    if (result.relatedEntities) {
      let tagToPages = [];
      let results = [];
      tagToPages = result.relatedEntities.filter(relatedEntity =>
        relatedEntity.relationship.type === "tagToPages"
      );
      tagToPages.forEach (item => {
        results.push(new ContentRelationship(item.relationship.entityId, item.relatedEntity.entity.entityId, item.relatedEntity.entity.data.info.internalUniquePageName));
      })

    return results;
    } else {
      return [];
    }
  }

  getImageRelationship(result: any): ImageInfo {
    if (result.relatedEntities) {
      const imageRelatedEntity = result.relatedEntities.filter(relatedEntity =>
        relatedEntity.relationship.type === "hasImage"
      )[0];
    return imageRelatedEntity ? imageRelatedEntity.relatedEntity.entity.data : null;
    } else {
      return null;
    }
  }

  updateState(app: App): void {
    this.redux.dispatch({ type: FORM_CHANGED, payload: { app } });
  }

  updateAppState(app: App): void {
    this.redux.dispatch({ type: UPDATE_APP_ACTION, payload: { app } });
  }

  resetAppState(): void {
    const app: App = new App();
    this.redux.dispatch({ type: RESET_APP_ACTION, payload: { app } });
  }

  public isChanged(): boolean {
    //@Todo: Get form change from redux state
    //const { form: { isFormChanged } } = this.redux.getState();
    //return isFormChanged;
    return false;
  }
}

const defaultState = {
  app: new App()
}
export default combineActionsToReducer({
  [FETCH_APP_BY_ID_ACTION]: (state, action) => {
    const { payload } = action;
    return {
      ...state,
      ...action.payload,
    }
  },
  [RESET_APP_ACTION]: (state, action) => {
    const { payload } = action;
    return {
      ...state,
      ...action.payload,
    }
  },
  [UPDATE_APP_ACTION]: (state, action) => {
    const { payload } = action;
    return {
      ...state,
      ...action.payload,
    }
  },
}, defaultState)
