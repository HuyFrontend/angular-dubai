import { FormGroup } from '@angular/forms';
export type FormType = '' | 'page' | 'content' | 'article' | 'post';
export type FormStatus = 'PENDING' | 'INVALID' | 'VALID' | 'DISABLED';

export interface IFormState {
    type: FormType;
    entityId: string;
    isSubmitted: boolean,
    isFormChanged: boolean,
    [property: string]: any,
    formGroupState: {
        [formGroupKey: string]: FormStatus
    },
    values: {
        [key: string]: any
    };
    errors: {
        [formName: string] : {
            [errorKey: string] : any
        }
    }
};

export interface ILayoutState {
    isLoading: boolean,
    isMenuCollapsed: boolean,
    isCreateNewCollapsed: boolean,
    isOpenNotificationPopup: boolean,
    isOpenLogOutPopup: boolean,
    isLoggedIn: boolean;
};
export interface IRouteState {
    expanded: boolean,
    selected: boolean,
    icon: String,
    pathMatch: String,
    order: number,
    target: String,
    title: String
};


export interface IPageState {
    form: any,
    dashboard: any
}
export interface IContentState {
    form: {
        editingSession: string,
        editingOrder: number,
        article: any,
        post: any
    },
    inQueues: any[];
}

export class Notification {
  constructor(){
    this.id = Math.floor(Date.now() / 1000).toString();
    this.display = true;
  }
  id: string
  type: string;
  mode: string;
  message: string;
  display: boolean;
}

export interface IAlertState {
    confirmation?: Notification,
    notifications: Notification[]
}

export interface IAuthUserState {
    id: String,
    displayName: String,
    familyName: String,
    givenName: String,
    locale: String,
    accessToken: String,
    email: String,
    picture: String
}

export class IAppState {
    layout?: ILayoutState;
    routes?: Array<IRouteState>;
    page?: IPageState;
    // content?: IContentState;
    authUser?: IAuthUserState;
    alerts?: IAlertState;
    form?: IFormState
};

export interface ISubType {
  isValid(): boolean;
  getSubTypeFormGroup(pageSubTypeData: any): FormGroup;
  switchType(type: string, pageSubTypeData: any, keepCommonValue: boolean): any;
}
