import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

import { combineActionsToReducer } from 'utils';
import { IRouteState } from './app-interfaces';


@Injectable()
export class RouteActions {
  // constants
  static GET_ALL_ROUTES: string = 'GET_ALL_ROUTES';
  static SET_ALL_ROUTES: string = 'SET_ALL_ROUTES';

  constructor(private redux: NgRedux<IRouteState>) { }
  setRoutes(routes: any) {
    this.redux.dispatch({ type: RouteActions.SET_ALL_ROUTES, payload: routes });
  }
}

const routeInitialState: IRouteState = {
  expanded: false,
  selected: false,
  icon: '',
  pathMatch: '',
  order: 0,
  target: '',
  title: ''
};

export const routeReducer = combineActionsToReducer({
  [RouteActions.SET_ALL_ROUTES]: (state, action) => {
    return state;
  }
}, routeInitialState);