import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'services';
// import { LayoutActions, AuthUserActions } from 'state';
import { User } from 'models';

@Component({
  selector: 'login',
  templateUrl: 'login.html',
  styleUrls: ['login.scss']
})

export class LoginComponent implements OnInit {
  private user: User = null;
  constructor(
    private authService: AuthService,
    // private layoutActions: LayoutActions,
    // private authUserActions: AuthUserActions,
    private router: Router) { }

  ngOnInit() {
    this.authService.login(this.user)
      .subscribe(userInfo => {
        console.log('userInfo', userInfo);
        if (userInfo) {
          // this.layoutActions.setLoggedIn(true);
          // this.authUserActions.setAuthUser(userInfo);
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      });
  }
  onRegister(): void {
    console.log('[onRegister] - isLogin: ', this.authService.isLogin);
  }
}
