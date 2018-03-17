import { Component, HostListener } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { LayoutActions, AuthUserActions } from 'state';
import { AuthService } from 'services';
/**
 * Top bar of page
 * 
 * @export
 * @class MBCTopbarComponent
 */

@Component({
  selector: 'mbc-topbar',
  templateUrl: 'mbc-topbar.html'
})

export class MBCTopbarComponent {

  /**
   * Local variable, flag for openning notification popup.
   * 
   * @private
   * @type {boolean}
   * @memberOf MBCTopbarComponent
   */
  private _isOpenNotificationPopup:  boolean = false;
  /**
   * Local variable, flag for openning logout popup.
   * 
   * @private
   * @type {boolean}
   * @memberOf MBCTopbarComponent
   */
  private _isOpenLogOutPopup: boolean = false;
  /**
   * Boolean Observable from store. isOpenNotificationPopup state
   * 
   * @type {Observable<boolean>}
   * @memberOf MBCTopbarComponent
   */
  @select(['layout', 'isOpenNotificationPopup']) isOpenNotificationPopup: Observable<boolean>;
  /**
   * Boolean Observable from store. isOpenLogOutPopup state
   * 
   * @type {Observable<boolean>}
   * @memberOf MBCTopbarComponent
   */
  @select(['layout', 'isOpenLogOutPopup']) isOpenLogOutPopup: Observable<boolean>;

  /**
   * Creates an instance of MBCTopbarComponent.
   * 
   * @param {LayoutActions} layoutActions
   * 
   * @memberOf MBCTopbarComponent
   */
  constructor(
    private layoutActions: LayoutActions,
    private authUserActions: AuthUserActions,
    private authService: AuthService
  ) {
    this.isOpenNotificationPopup.subscribe(x=> this._isOpenNotificationPopup = x);
    this.isOpenLogOutPopup.subscribe(x=> this._isOpenLogOutPopup = x);
  }

  /**
   * Toggle notification popup on Top of page.
   * 
   * @returns {false}: Always to prevent redirecting page
   * 
   * @memberOf MBCTopbarComponent
   */
  public toggleNotificationPopup(){
    this.layoutActions.openNotificationPopup(!this._isOpenNotificationPopup);

    return false;
  }

  /**
   * Toggle notification popup on Top of page.
   * 
   * @returns {false}: Always to prevent redirecting page
   * 
   * @memberOf MBCTopbarComponent
   */
  public toggleLogoutPopup(){
    this.layoutActions.openLogoutPopup(!this._isOpenLogOutPopup);

    return false;
  }

  /**
   * Logout on Top of page.
   * 
   * @returns {false}: Always to prevent redirecting page
   * 
   * @memberOf MBCTopbarComponent
   */
  public onLogout(){
    this.authUserActions.removeAuthUser();
    this.authService.logout();
    
    // update redux state
    // this.layoutActions.setLoggedOut(false);
    
    return false;
  }

  /**
   * Catch event when mouse out focus of the element
   * then hide pop up.
   * 
   * @memberOf MBCTopbarComponent
   */
  @HostListener('focusout', ['$event.target'])
  public onLeaveLogoutPopup() {
    this.layoutActions.openLogoutPopup(false);
  }
  /**
   * Catch event when mouse out focus of the element
   * then hide pop up. 
   * 
   * @memberOf MBCTopbarComponent
   */
  @HostListener('focusout', ['$event.target'])
  public onLeaveNotification() {
    this.layoutActions.openNotificationPopup(false);
  }
  /**
   * Toggle sidebar menu on left
   * 
   * @returns
   * 
   * @memberOf MBCTopbarComponent
   */
  public toggleMenu() {
    this.layoutActions.toggleLeftSideBar();
    // Return false for preventing navigate page by <a> tag
    return false;
  }
}
