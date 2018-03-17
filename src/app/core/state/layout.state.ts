import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { LocalStorageService } from 'ngx-webstorage';
import { ILayoutState } from './app-interfaces';
import { combineActionsToReducer } from 'utils';

const SET_LOGGED_IN: string = 'LAYOUT_STATE/SET_LOGGED_IN';
const SET_LOGGED_OUT: string = 'LAYOUT_STATE/SET_LOGGED_OUT';
const TOGGLE_LEFT_SIDEBAR: string = 'LAYOUT_STATE/TOGGLE_LEFT_SIDEBAR';
const TOGGLE_CREATE_NEW_SIDEBAR: string = 'LAYOUT_STATE/TOGGLE_CREATE_NEW_SIDEBAR';
const TOGGLE_NOTIFICATION_POPUP: string = 'LAYOUT_STATE/TOGGLE_NOTIFICATION_POPUP';
const TOGGLE_LOGOUT_POPUP: string = 'LAYOUT_STATE/TOGGLE_LOGOUT_POPUP';
const TOGGLE_LOADING: string = 'LAYOUT_STATE/TOGGLE_LOADING';
/**
 * Define all common actions for handling sidebar, popup that relatived with layout 
 * 
 * @export
 * @class LayoutActions
 */
@Injectable()
export class LayoutActions {
  /**
   * Creates an instance of LayoutActions.
   * 
   * @param {NgRedux<ILayoutState>} redux
   * 
   * @memberOf LayoutActions
   */
  constructor(
    private redux: NgRedux<ILayoutState>,
    private localStorageService: LocalStorageService
  ) {}
  
  hideLoading() {
    this.redux.dispatch({
        type: TOGGLE_LOADING,
        payload: false
    });
  }

  showLoading() {
    this.redux.dispatch({
        type: TOGGLE_LOADING,
        payload: true
    });
  }
  /**
   * Set isLoggedIn flag 
   * 
   * @param {boolean} isLoggedIn
   * 
   * @memberOf LayoutActions
   */
  setLoggedIn(isLoggedIn: boolean) {
    this.redux.dispatch({
        type: SET_LOGGED_IN,
        payload: isLoggedIn
    });
  }
  
  /**
   * Set isLoggedOut flag 
   * 
   * @param {boolean} isLoggedIn
   * 
   * @memberOf LayoutActions
   */
  setLoggedOut(isLoggedIn: boolean) {
    this.localStorageService.clear('auth_user');
    this.redux.dispatch({
        type: SET_LOGGED_OUT,
        payload: isLoggedIn
    });
  }
private tst: boolean = false;
  /**
   * Toggle display left sidebar
   * 
   * 
   * @memberOf LayoutActions
   */
  toggleLeftSideBar() {
    this.tst = !this.tst;
    this.redux.dispatch({ type: TOGGLE_LEFT_SIDEBAR, payload: this.tst });
  }

  /**
   * Toggle display create new sidebar
   * 
   * @param {boolean} isOpen
   * 
   * @memberOf LayoutActions
   */
  toggleCreateNewSideBar(isOpen: boolean) {
    this.redux.dispatch({ type: TOGGLE_CREATE_NEW_SIDEBAR, payload: isOpen });
  }
  
  /**
   * Open Logout popup
   * 
   * @param {boolean} isOpen
   * 
   * @memberOf LayoutActions
   */
  openLogoutPopup(isOpen: boolean) {
    this.redux.dispatch({ type: TOGGLE_LOGOUT_POPUP, payload: isOpen });
  }

  /**
   * Open Notification popup
   * 
   * @param {boolean} isOpen
   * 
   * @memberOf LayoutActions
   */
  openNotificationPopup(isOpen: boolean) {
    this.redux.dispatch({ type: TOGGLE_NOTIFICATION_POPUP, payload: isOpen });
  }
}

const layoutInitialState: ILayoutState = {
  isLoading: false,
  isMenuCollapsed: false,
  isCreateNewCollapsed: false,
  isOpenNotificationPopup: false,
  isOpenLogOutPopup: false,
  isLoggedIn: false
};

export const layoutReducer =  combineActionsToReducer({
  [TOGGLE_LOADING]: (state, action) => {
      return {
        ...state,
        isLoading: action.payload
      } 
  },
  [SET_LOGGED_IN]: (state: any, action: any) => {
    return Object.assign({}, state, {
      isLoggedIn: true
    })
  },
  [SET_LOGGED_OUT]: (state: any, action: any) => {
    return Object.assign({}, state, {
      isLoggedIn: false
    })
  },
  [TOGGLE_LEFT_SIDEBAR]: (state, action) => {
    return Object.assign({}, state, {
      isMenuCollapsed: !state.isMenuCollapsed
    });
  },
  [TOGGLE_CREATE_NEW_SIDEBAR]: (state, action) => {
    return Object.assign({}, state, {
      isCreateNewCollapsed: !state.isCreateNewCollapsed
    });
  },
  [TOGGLE_NOTIFICATION_POPUP]: (state, action) => {
    const { payload } = action;
    return Object.assign({}, state, {
      isOpenNotificationPopup: payload,
      isOpenLogOutPopup: false
    });
  },
  [TOGGLE_LOGOUT_POPUP]: (state, action) => {
    const { payload } = action;
    return Object.assign({}, state, {
      isOpenNotificationPopup: false,
      isOpenLogOutPopup: payload
    });
  }
}, layoutInitialState);