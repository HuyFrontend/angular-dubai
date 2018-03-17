import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { 
  ContentComponent, 
  CreateArticleComponent, CreatePostComponent,
  DetailArticleComponent, DetailPostComponent
} from './pages';

const contentRoutes: Routes = [
  {
    path: '',
    component: ContentComponent
  },
  {
      path: 'article',
      component: CreateArticleComponent
  },
  {
      path: 'article/:entityId',
      component: DetailArticleComponent
  },
  {
      path: 'post',
      component: CreatePostComponent
  },
  {
      path: 'post/:entityId',
      component: DetailPostComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(contentRoutes)],
  exports: [RouterModule]
})
export class ContentRoutingModule {}
