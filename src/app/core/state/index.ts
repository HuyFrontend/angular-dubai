import { combineReducers } from 'redux';
export * from './app-interfaces';

import { formReducer, FormActions } from './form.state';
import { LayoutActions, layoutReducer } from './layout.state';
import { AuthUserActions, authUserReducer, authUserInitialState } from './auth-user.state';
import { PageActions, pageReducer } from './page.state';
import { RouteActions, routeReducer } from './route.state';
import { alertsReducer, AlertsActions } from './alerts.state';
import { ContentActions } from './content.state';
import reduxFormReducer from './redux-form.state';
import { PostActions } from './post.state';
import { CampaignActions } from './campaign.state';
import { AppActions } from './apps.state';
import { IAppState } from './app-interfaces';

/**
 * Define all actions that will be injected in app as global.
*/
const GLOBAL_ACTIONS = [
    LayoutActions,
    AuthUserActions,
    RouteActions,
    PageActions,
    AlertsActions,
    ContentActions,
    PostActions,
    FormActions,
    CampaignActions,
    AppActions
];

const rootReducer = combineReducers<IAppState>({
    layout: layoutReducer,
    authUser: authUserReducer,
    routes: routeReducer,
    page: pageReducer,
    alerts: alertsReducer,
    form: formReducer,
    forms: reduxFormReducer
});

export {
    GLOBAL_ACTIONS,
    LayoutActions,
    AuthUserActions,
    RouteActions,
    PageActions,
    AlertsActions,
    ContentActions,
    PostActions,
    FormActions,
    CampaignActions,
    AppActions,
    rootReducer
}
