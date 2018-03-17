import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageAppsComponent } from './pages';
import { AppDetailComponent } from "features/apps/pages/detail";


const contentRoutes: Routes = [
 {
    path: '',
    component: ManageAppsComponent
  },
  {
    path: 'create',
    component: AppDetailComponent
  },
  {
    path: 'detail/:entityId',
    component: AppDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(contentRoutes)],
  exports: [RouterModule]
})
export class AppsRoutingModule {}
