import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageGroupComponent } from './page-groups.component';
import { GroupCreateComponent } from './group-create.component';
import { GroupDetailComponent } from './group-detail.component';

const pagesRoutes: Routes = [
  {
    path: '',
    component: PageGroupComponent
  },
  {
    path: 'create',
    component: GroupCreateComponent
  },
  {
    path: 'detail/:groupId',
    component: GroupDetailComponent 
  },
];

@NgModule({
  imports: [RouterModule.forChild(pagesRoutes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
