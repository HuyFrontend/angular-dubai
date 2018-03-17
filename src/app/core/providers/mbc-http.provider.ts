import { Injectable, FactoryProvider } from '@angular/core';
import {
    ConnectionBackend, XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Http, Headers
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from 'utils/storage';

import { AlertsActions } from 'state';
/**
 * Override ng Http service with customization headers.
 *
 * @export
 * @class MBCHttpProvider
 * @extends {Http}
 */
@Injectable()
class MBCHttpProvider extends Http {
    private defaultOptions: RequestOptionsArgs;
    private alertsActions: AlertsActions
    constructor(
        backend: ConnectionBackend,
        _defaultOptions: RequestOptions,
        alertsActions: AlertsActions,
        headers?: Headers
    ) {
        _defaultOptions.headers.set('Content-Type', 'application/vnd.mbc.v1+json;charset=UTF-8');

        const authUser = Storage.get('auth_user');
        if (authUser && authUser.accessToken) {
            const { accessToken } = authUser;
            _defaultOptions.headers.set('Authorization', `Bearer ${accessToken}`);
        }
        super(backend, _defaultOptions);
        this.defaultOptions = _defaultOptions;
        this.alertsActions = alertsActions;
    }

    getOptions(options?: RequestOptionsArgs): RequestOptionsArgs {
        const requestOptions = options ? options : this.defaultOptions;
        return requestOptions;
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return super.request(url, this.getOptions(options))
            .catch((err, caught) => this.handleError(err, caught));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<any> {
        return super.get(url, this.getOptions(options))
            .map(x => x.json())
            .catch((err, caught) => this.handleError(err, caught));
    }

    post(url: string, body: string, options?: RequestOptionsArgs): Observable<any> {
        return super.post(url, body, this.getOptions(options))
            .map(x => x.json())
            .catch((err, caught) => this.handleError(err, caught));
    }

    put(url: string, body: string, options?: RequestOptionsArgs): Observable<any> {
        return super.put(url, body, this.getOptions(options))
            .catch((err, caught) => this.handleError(err, caught));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.delete(url, this.getOptions(options))
            .catch((err, caught) => this.handleError(err, caught));
    }

    // middlewares happen after fetch data from server
    handleError(error: Response, caught: any): Observable<Response> {
        this.alertsActions.showError(error.json().message || 'Server Error');
        return Observable.throw(error.json().error || 'Server error');
    }
}

function providerFactory(alertsActions: AlertsActions, headers?: Headers) {
    return (connectionBackend: XHRBackend, defaultOptions: RequestOptions) => {
        return new MBCHttpProvider(connectionBackend, defaultOptions, alertsActions, headers);
    }
}
const MBC_HTTP_PROVIDER = {
    provide: Http,
    useClass: MBCHttpProvider,
    useFactory: providerFactory,
    deps: [XHRBackend, RequestOptions, AlertsActions]
}
export {
    MBCHttpProvider,
    MBC_HTTP_PROVIDER,
    providerFactory
}
