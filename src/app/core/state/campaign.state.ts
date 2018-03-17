import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { combineActionsToReducer } from 'utils';
import { AlertsActions } from './alerts.state';
import { IAppState } from './app-interfaces';
import { FORM_CHANGED } from './redux-form.state';
import { Campaign, CampaignResult } from 'models';
import { CampaignService } from 'services';

const FETCH_CAMPAIGN_BY_ID_ACTION: string = 'PAGE_STATE/FETCH_CAMPAIGN_BY_ID_ACTION';
const RESET_CAMPAIGN_ACTION: string = 'PAGE_STATE/RESET_CAMPAIGN_ACTION';
const UPDATE_CAMPAIGN_ACTION: string = 'PAGE_STATE/UPDATE_CAMPAIGN_ACTION';

@Injectable()
export class CampaignActions {
    constructor(
        private redux: NgRedux<IAppState>,
        private alertsActions: AlertsActions,
        private campaignService: CampaignService
        ) { 

    }

    updateState(campaign: Campaign): void {
        this.redux.dispatch({ type: FORM_CHANGED, payload: { campaign }});
    }

    updateCampaignState(campaign: Campaign): void {
        this.redux.dispatch({ type: UPDATE_CAMPAIGN_ACTION, payload: { campaign }});
    }

    resetCampaignState(): void {
        const campaign: Campaign = new Campaign();
        this.redux.dispatch({ type: RESET_CAMPAIGN_ACTION, payload: { campaign }});
    }

    public isChanged() : boolean {
        //@Todo: Get form change from redux state
        //const { form: { isFormChanged } } = this.redux.getState();
        //return isFormChanged;
        return false;
      }

    fetchCampaignById(campaignId: string) {
        this.campaignService.getCampaignById(campaignId)
            .subscribe(result => {
                if(!result.result){
                    result.result = new CampaignResult();
                }
                this.redux.dispatch({ type: FETCH_CAMPAIGN_BY_ID_ACTION, payload: { campaign: {...result} }});
            });
    }
}

const defaultState = {
    campaign: new Campaign()
} 
export default combineActionsToReducer({  
    [FETCH_CAMPAIGN_BY_ID_ACTION]: (state, action) => {
        const { payload } = action;
        return {
            ...state,
            ...action.payload,
        }
    },
    [RESET_CAMPAIGN_ACTION]: (state, action) => {
        const { payload } = action;
        return {
            ...state,
            ...action.payload,
        }
    },
    [UPDATE_CAMPAIGN_ACTION]: (state, action) => {
        const { payload } = action;
        return {
            ...state,
            ...action.payload,
        }
    },
}, defaultState)
