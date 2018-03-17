import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CampaignDetailComponent, ManageCampaignComponent } from './pages';


const contentRoutes: Routes = [
 {
    path: '',
    component: ManageCampaignComponent
  },
  {
      path: 'create',
      component: CampaignDetailComponent
  },
  {
    path: 'detail/:entityId',
    component: CampaignDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(contentRoutes)],
  exports: [RouterModule]
})
export class CampaignRoutingModule {}
