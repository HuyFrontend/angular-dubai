import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { combineActionsToReducer } from 'utils';
import { PAGE_STATUS } from 'constant';
import { PageModel, PageInfo, PageMeta, PageSetting, PageGroup } from 'models';

import { AppConfigService, PageService } from 'services';
import { storageConfigs } from 'configs';
import { NOTIFICATION_TYPE } from 'constant';

import { AlertsActions } from './alerts.state';
import { IPageState } from './app-interfaces';

const RESET_PAGE_FORM: string = 'PAGE_STATE/RESET_PAGE_FORM';
const GET_NEW_PAGE_INS_ACTION: string = 'PAGE_STATE/GET_NEW_PAGE_INS_ACTION';
const FETCH_PAGE_BY_ID_ACTION: string = 'PAGE_STATE/FETCH_PAGE_BY_ID_ACTION';
const SAVE_NEW_PAGE_ACTION: string = 'PAGE_STATE/SAVE_NEW_PAGE_ACTION';
const SAVE_PAGE_DETAIL_ACTION: string = 'PAGE_STATE/SAVE_PAGE_DETAIL_ACTION';
const PUBLISH_PAGE_ACTION: string = 'PAGE_STATE/PUBLISH_PAGE_ACTION';
const CHANGE_PAGE_GROUP_ACTION: string = 'PAGE_STATE/CHANGE_PAGE_GROUP_ACTION';

const VALID_SET_FORM_STATE: string = 'PAGE_STATE/VALID_SET_FORM_STATE';
const FETCH_PAGE_CONFIG: string = 'PAGE_STATE/FETCH_PAGE_CONFIG';

/**
 * Define all common actions for handling sidebar, popup that relatived with layout
 *
 * @export
 * @class PageActions
 */
@Injectable()
export class PageActions {
    /**
     * Creates an instance of PageActions.
     *
     * @param {NgRedux<ILayoutState>} redux
     *
     * @memberOf PageActions
     */
    constructor(
        private redux: NgRedux<IPageState>,
        private appConfigService: AppConfigService,
        private alertsActions: AlertsActions,
        private pageService: PageService) { }

    resetForm() {
        this.redux.dispatch({ type: RESET_PAGE_FORM, payload: this.getNewPageInstance() });
    }
    private getNewPageInstance(): PageModel {
        const pModel: PageModel = new PageModel();
        pModel.info = new PageInfo();
        pModel.settings = new PageSetting();
        pModel.meta = new PageMeta();
        return pModel;
    }

    copyPage(pageId: string) {
        this.pageService.fetchPageById(pageId)
            .subscribe(result => {
                // convert return object to PageModel
                const { data } = result;
                const { info } = data;
                info.internalUniquePageName = 'Copy - ' + info.internalUniquePageName;
                info.customURL = '';
                this.redux.dispatch({ type: GET_NEW_PAGE_INS_ACTION, payload: { ...data } });
            });
    }

    /**
     *
     *
     *
     * @memberOf PageActions
     */
    addPage() {
        this.redux.dispatch({ type: GET_NEW_PAGE_INS_ACTION, payload: this.getNewPageInstance() });
    }

    /**
     *
     *
     * @param {string} pageId
     *
     * @memberOf PageActions
     */
    publishPage(pageId: string): Observable<any> {
        return this.pageService.publishPage([pageId]).map(x => {
            const page = x[0];
            this.redux.dispatch({ type: PUBLISH_PAGE_ACTION, payload: page });
            return page;
        });
    }

    /**
     *
     *
     * @param {PageModel} pageModel
     *
     * @memberOf PageActions
     */
    savePage(pageModel: PageModel, showMessage: boolean = true): Observable<any> {
        let bodyPage = {
            data: {
                info: pageModel.info,
                settings: pageModel.settings,
                meta: pageModel.meta,
                infoComponents: pageModel.infoComponents
            },
            pageGroup: pageModel.pageGroup,
        };
        if (pageModel.entityId && pageModel.entityId != null) {
            bodyPage['entityId'] = pageModel.entityId;
        }
        return this.pageService.save(bodyPage)
            .map(x => {
                if (pageModel.entityId) {
                    const newPage = {
                        ...pageModel
                    };
                    this.redux.dispatch({ type: SAVE_PAGE_DETAIL_ACTION, payload: newPage });
                }
                if(showMessage){
                    this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, 'Saved successfully');
                }
                return x;
            });
    }

    /**
     *
     *
     * @param {string} pageId
     *
     * @memberOf PageActions
     */
    fetchPageById(pageId: string) {
        this.pageService.fetchPageById(pageId)
            .subscribe(result => {
                // convert return object to PageModel
                const { data, entityId, status, pageGroup } = result;
                this.redux.dispatch({
                    type: FETCH_PAGE_BY_ID_ACTION,
                    payload: {
                        entityId,
                        status,
                        pageGroup,
                        ...data
                    }
                });
            });
    }

    /**
     *
     *
     *
     * @memberOf PageActions
     */
    fetchConfigByTypes() {
      const _listConfigNeed = [
        'occupations',
        'pageTabs',
        'pageTypes',
        'profileSubTypes',
        'showSubTypes',
        'channelSubTypes',
        'eventsSubTypes',
        'sectionSubTypes',
        'businessSubTypes',
        'awardSubTypes',
        'countries',
        'nationalities',
        'sportTypes',
        'skillLevels',
        'musicTypes',
        'genres',
        'originalLanguages',
        'subtitlingAndDubbing',
        'censorshipClasses',
        'dialects',
        'regions',
        'category',
        'industries',
        'subindustries',
        'awardTitleFilm',
        'awardTitleMusic',
        'awardTitleSport',
        'awardTitleTelevision',
        'awardTitleBeautyPageant',
      ];
      const _lang = 'en';
      this.appConfigService.fetchConfigByTypes(storageConfigs.page, _listConfigNeed, _lang).subscribe();
    }

    /**
     *
     *
     * @param {PageModel} model
     *
     * @memberOf PageActions
     */
    setFormState(model: PageModel) {
        this.redux.dispatch({
            type: VALID_SET_FORM_STATE,
            payload: model
        });
    }

    changePageGroup(pageGroup: any) {
        this.redux.dispatch({
            type: CHANGE_PAGE_GROUP_ACTION,
            payload: {
                pageGroup
            }
        });
    }
}

// TODO: which one should store in cache?
const pageInitialState: IPageState = {
    form: {
        page: new PageModel()
    },
    dashboard: {
        page: {
            queries: [],
            data: [] // should store in cache?
        },
        pageGroup: {
            queries: [],
            data: [] // should store in cache?
        }
    }
};

export const pageReducer = combineActionsToReducer(
    {
        [RESET_PAGE_FORM]: (state, action) => {
            const { payload: page } = action;
            return {
                ...state,
                form: {
                    ...state.form,
                    page: { ...page }
                }
            }
        },
        [FETCH_PAGE_CONFIG]: (state, action) => {
            // do nothing
        },
        [PUBLISH_PAGE_ACTION]: (state, action) => {
            const { payload } = action;
            const { form: { page } } = state;

            return {
                ...state,
                form: {
                    page: {
                        ...page,
                        status: payload.status
                    }
                }
            }
        },
        [GET_NEW_PAGE_INS_ACTION]: (state, action) => {
            const { payload } = action;
            return {
                ...state,
                form: {
                    page: { ...payload }
                }
            }
        },
        [FETCH_PAGE_BY_ID_ACTION]: (state, action) => {
            const { payload } = action;

            return {
                ...state,
                form: {
                    page: { ...payload }
                }
            }
        },
        [SAVE_NEW_PAGE_ACTION]: (state, action) => {
            const { payload } = action;
            return {
                ...state,
                form: {
                    page: {
                        ...payload
                    }
                }
            }
        },
        [SAVE_PAGE_DETAIL_ACTION]: (state, action) => {
            const { payload } = action;
            return {
                ...state,
                form: {
                    page: { ...payload }
                }
            }
        },
        [VALID_SET_FORM_STATE]: (state, action) => {
            const { payload } = action;
            const { page } = state.form;
            return {
                ...state,
                form: {
                    page: {
                        ...payload
                    }
                }
            }
        },
        [CHANGE_PAGE_GROUP_ACTION]: (state, action) => {
            const { payload: { pageGroup } } = action;
            const { page } = state.form;
            return {
                ...state,
                form: {
                    ...state.form,
                    page: {
                        ...page,
                        pageGroup
                    }
                }
            }
        }
    },
    pageInitialState);
