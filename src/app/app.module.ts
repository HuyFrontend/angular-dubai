import { NgModule, FactoryProvider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgReduxModule } from '@angular-redux/store';
import { Ng2Webstorage } from 'ngx-webstorage';

import { ShareModule } from 'components';
import { GLOBAL_ACTIONS } from 'state';
import { GLOBAL_APP_PROVIDERS } from 'providers';
import { GLOBAL_SERVICES_PROVIDERS } from 'services';
import { GLOBAL_GUARDS_PROVIDERS } from 'guards';
import { GLOBAL_APP_DIRECTIVES } from 'directives';

import { SHARE_COMPNENTS } from 'components/shared-components';
import { DashboardComponent } from 'features/dashboard';

import { AppRoutingModule } from './app.routes';
import { BootstrapComponent } from './bootstrap.component';
import { AppComponent } from './app.component';

/**
  NOTE
  @NgModule: help organize an application into cohesive blocks of functionality
  Ref: https://angular.io/docs/ts/latest/guide/ngmodule.html#!#angular-modularity
  @BrowserModule, the module every browser app must import, registers critical application service providers.
  @declarations: list identifies the application's only component
  @bootstrap: Angular offers a variety of bootstrapping options, targeting multiple platforms
 */

// Angular modules consolidate components, directives and pipes into cohesive blocks of functionality,
// each focused on a feature area, application business domain, workflow, or common collection of utilities.

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgReduxModule,
    Ng2Webstorage,
    AppRoutingModule,
    ShareModule,
  ],
  declarations: [
    DashboardComponent,
    BootstrapComponent,
    AppComponent
  ],
  providers: [
    ...GLOBAL_APP_DIRECTIVES,
    ...GLOBAL_APP_PROVIDERS,
    ...GLOBAL_SERVICES_PROVIDERS,
    ...GLOBAL_ACTIONS,
    ...GLOBAL_GUARDS_PROVIDERS
  ],
  bootstrap: [BootstrapComponent]
})

export class AppModule { }
// imports makes the exported declarations of other modules available in the current module
// declarations are to make directives from the current module available to other directives in the current module.
// Selectors of directives, components or pipes are only matched against the HTML if they are declared or imported.
// providers are to make services and values known to DI.
// They are added to the root scope and they are injected to other services or directives that have them as dependency.
