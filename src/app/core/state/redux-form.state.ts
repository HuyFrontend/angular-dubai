import { Reducer, Action } from 'redux';
import campaign from './campaign.state';
import apps from './apps.state';
import { IAppState } from './app-interfaces';
import { Campaign } from 'models';

export const FORM_CHANGED = 'FORM_CHANGED';

export const composeReducers = <State>(...reducers: Reducer<State>[]): Reducer<State> =>
  (s: State, action: Action) =>
    reducers.reduce((st, reducer) => reducer(st, action), s);


function defaultFormReducer(state, action: Action & {payload?}) {
    switch (action.type) {
        case FORM_CHANGED:
            return {
                ...state,
                ...action.payload.value,
            }
        default:
        break;
    }
    return state;
}

export default composeReducers(
    defaultFormReducer,
    campaign,
    apps
)
