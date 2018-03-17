import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { NOTIFICATION_TYPE, NOTIFICATION_MODE } from 'constant';
import { combineActionsToReducer } from 'utils';
import { IAlertState, Notification } from './app-interfaces';

const CLEAR_ALL_NOTIFICATIONS: string = 'NOTIFICATION_STATE/CLEAR_ALL_NOTIFICATIONS';
const HIDE_NOTIFICATION: string = 'NOTIFICATION_STATE/HIDE_NOTIFICATION';
const SHOW_NOTIFICATION: string = 'NOTIFICATION_STATE/SHOW_NOTIFICATION';
const SHOW_CONFIRMATION: string = 'NOTIFICATION_STATE/SHOW_CONFIRMATION';


/**
 *  Define all actions to handle show/hide alert, notification on right and modals.
 *
 * @export
 * @class AlertsActions
 */
@Injectable()
export class AlertsActions {

  constructor(private redux: NgRedux<IAlertState>) {}

  /**
   * Helper method to show global error message, message will stay as sticky note and can be closed by clicking on it
   */
  showError(message: string) {
    this.show(NOTIFICATION_TYPE.ERROR, message);
  }

  /**
   * Helper method to show global warning message, message will shown as notification and hide after several seconds
   */
  showWarning(message: string) {
    this.show(NOTIFICATION_TYPE.WARNING, message);
  }

  /**
   * Helper method to show global success message, message will shown as notification and hide after several seconds
   */
  showInfo(message: string) {
    this.show(NOTIFICATION_TYPE.INFO, message);
  }

  /**
   * Helper method to show global success message, message will shown as notification and hide after several seconds
   */
  showSuccess(message: string) {
    this.show(NOTIFICATION_TYPE.SUCCESS, message);
  }

  /**
   * Helper method to show global success/error/warning/info message
   */
  show(type:string = NOTIFICATION_TYPE.INFO, msg: string, mode:string = NOTIFICATION_MODE.DEFAULT) {
    const notification = new Notification();
    notification.message = msg;
    notification.type = type;
    notification.mode = mode;

    this.redux.dispatch({ type: SHOW_NOTIFICATION, payload: notification });
  }


  // FIXME:
  addQueueForHide(id: string){
    const currentState = this.redux.getState();
    Observable.interval(2000)
              .take(1)
              .subscribe(x=> this.hide(id));
  }

  hide(id: string) {
    this.redux.dispatch({ type: HIDE_NOTIFICATION, payload: id });
  }

  clearAll() {
    this.redux.dispatch({ type: HIDE_NOTIFICATION, payload: null });
  }
}

export const alertsInitialState: IAlertState = {
  confirmation: null,
  notifications: []
};

export const alertsReducer = combineActionsToReducer({
  [SHOW_CONFIRMATION]: (state, action) => {
    const { payload } = action;
    return {
      ...state,
      confirmation: payload
    }
  },
  [SHOW_NOTIFICATION]: (state, action) => {
    const { payload } = action;
    return {
      ...state,
      notifications: [payload]
    }
  },
  [HIDE_NOTIFICATION]: (state, action) => {
    const { payload } = action;
    const { notifications } = state;
    const newState = notifications.filter(x=> x.id !== payload);
    return {
      ...state,
      notifications: newState
    }
  },
  [CLEAR_ALL_NOTIFICATIONS]: (state, action) => {
    return {
      ...state,
      notifications: []
    }
  }
}, alertsInitialState);
