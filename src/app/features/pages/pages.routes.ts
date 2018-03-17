import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageComponent, PageDetailComponent, PageCreateComponent } from './pages';

const pagesRoutes: Routes = [
  {
    path: '',
    component: PageComponent
  },
  {
    path: 'detail/:pageId',
    component: PageDetailComponent
  },
  {
    path: 'create',
    component: PageCreateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(pagesRoutes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
