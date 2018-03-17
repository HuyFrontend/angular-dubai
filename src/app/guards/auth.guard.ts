import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import {
  Router,
  ActivatedRouteSnapshot,
  ActivatedRoute,
  RouterStateSnapshot
} from '@angular/router';

import { LayoutActions, AuthUserActions } from 'state';
import { isDevelopmentMode } from 'utils';

import { AuthService } from 'services';

// Guide: https://codecraft.tv/courses/angular/routing/router-guards/
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private layoutActions: LayoutActions,
    private authUserActions: AuthUserActions
  ) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // TODO: At this moment, pass it for development mode.
    if (isDevelopmentMode()) {
      this.layoutActions.setLoggedIn(true);//to display <mbc-ap>
      return true;
    }

    if (!this.authService.isLogin) {
      console.warn('No permission was granted, please login first!');
      this.router.navigate(['/auth/login']);
      return false;
    } else {
      this.layoutActions.setLoggedIn(this.authService.isLogin);
      const user = this.authService.user;
      this.authUserActions.setAuthUser(user);
    }

    return this.authService.isLogin;
  }
}
