import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { User } from 'models';
import { Storage } from 'utils/storage';
import jwtDecode from 'jwt-decode';

@Injectable()
export class AuthService {
    static loginUrl = '/login';
    static userKey = 'auth_user';

    private _user: User = null;
    private _isLogin: boolean = false;

    constructor(
        private http: Http,
        private activatedRoute: ActivatedRoute
    ) {
        this._user = Storage.get(AuthService.userKey);
    }

    login(user: User) {
        return this.activatedRoute.queryParams.first()
            .map((params: Params) => {
                let token = params['token'];
                let userInfo;
                if (token != undefined && token != '') {
                    this._isLogin = true;
                    let tokenInfo = jwtDecode(token);

                    const id = tokenInfo.sub;
                    const displayName = tokenInfo.name;
                    const familyName = tokenInfo.family_name;
                    const givenName = tokenInfo.given_name;
                    const accessToken = token;
                    const { family_name, given_name, locale, email, picture } = tokenInfo;
                    userInfo = new User(id, displayName, familyName, givenName, locale, accessToken, email, picture);

                    Storage.set(AuthService.userKey, userInfo);

                    return Observable.of(userInfo);
                } else {
                    window.location.href = AuthService.loginUrl; // TODO: inject window/document object

                    return Observable.of(userInfo);
                }
            })
            .flatMap(q => q);
    }

    logout(): void {
        Storage.remove(AuthService.userKey);
        this._isLogin = false;
        window.location.href = AuthService.loginUrl;
    }

    get isLogin(): boolean {
        if (!this._isLogin) {
            const user = this.user;
            if (user) {
                this._isLogin = true;
            }
        }
        return this._isLogin;
    }

    get user() {
        if (!this._user) {
            try {
                this._user = Storage.get(AuthService.userKey);
                // TODO: check token expired              
            } catch (e) { }
        }
        return this._user;
    }
}