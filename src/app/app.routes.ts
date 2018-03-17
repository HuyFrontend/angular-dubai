import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from 'guards';
import { DashboardComponent } from 'features/dashboard';
import { ErrorComponent } from 'components/shared-components';
/**
  NOTE
  Official Ref: https://angular.io/docs/ts/latest/guide/router.html
  <base href>
    Most routing applications should add a <base> element to the index.html as the first child in the <head> tag
    to tell the router how to compose navigation URLs.

  RouterOutlet
    RouterOutlet is a component from the router library.
    The router displays views within the bounds of the <router-outlet> tags.

    Never call RouterModule.forRoot in a feature routing module.
    Always call RouterModule.forChild in a feature routing module.
    forRoot and forChild are conventional names for methods that deliver different import values to root
    and feature modules. Angular doesn't recognize them but Angular developers do.
  <!-- Routed views go here -->
    <router-outlet></router-outlet>
 */

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/pages',
        pathMatch: 'full'
      },
      {
        path: 'pages',
        loadChildren: './features/pages/pages.module#PagesModule'
      },
      {
        path: 'content',
        loadChildren: './features/content/content.module#ContentModule'
      },
      {
        path: 'page-groups',
        loadChildren: './features/pageGroups/page-groups.module#PageGroupsModule'
      },
      {
        path: 'campaigns',
        loadChildren: './features/campaign/campaign.module#CampaignModule'
      },
      {
        path: 'apps',
        loadChildren: './features/apps/apps.module#AppsModule'
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    redirectTo: '/pages'
    // component: DashboardComponent
  },
  {
    path: 'auth',
    loadChildren: './features/auth/auth.module#AuthModule'
  },
  {
    path: '**',
    component: ErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }