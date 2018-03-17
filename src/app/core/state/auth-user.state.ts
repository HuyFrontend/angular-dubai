import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { LocalStorageService } from 'ngx-webstorage';
import { IAuthUserState } from './app-interfaces';
import { combineActionsToReducer } from 'utils';
/**
 * Define all common actions for handling authentication user
 * 
 * @export
 * @class Authentication User Actions
 */
@Injectable()
export class AuthUserActions {

	static SET_AUTH_USER: string = 'AUTH_USER/SET_AUTH_USER';
	static REMOVE_AUTH_USER: string = 'AUTH_USER/REMOVE_AUTH_USER';

  /**
   * Creates an instance of AuthUserActions.
   * 
   * @param {NgRedux<ILayoutState>} redux
   * 
   * @memberOf AuthUserActions
   */
	constructor(
		private redux: NgRedux<IAuthUserState>,
		private localStorageService: LocalStorageService
	) { }

  /**
   * Set auth user information 
   * 
   * @param {object} user
   * 
   * @memberOf AuthUserActions
   */
	setAuthUser(user: object) {
		this.redux.dispatch({
			type: AuthUserActions.SET_AUTH_USER,
			payload: user
		});
	}
  /**
   * Remove auth user information 
   * 
   * @memberOf AuthUserActions
   */
	removeAuthUser() {
		this.redux.dispatch({
			type: AuthUserActions.REMOVE_AUTH_USER
		});
	}
}

export const authUserInitialState: IAuthUserState = {
	id: '',
	displayName: '',
	familyName: '',
	givenName: '',
	locale: '',
	accessToken: '',
	email: '',
	picture: ''
};

export const authUserReducer = combineActionsToReducer({
	[AuthUserActions.SET_AUTH_USER]: (state: any, action: any) => {
		return {
			...state,
			...action.payload
		}
	},
	[AuthUserActions.REMOVE_AUTH_USER]: (state: any, action: any) => {
		return {
			...state,
			...authUserInitialState
		}
	}
}, authUserInitialState);