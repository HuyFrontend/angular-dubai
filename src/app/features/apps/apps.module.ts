import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import * as Quill from 'quill';

import { MFormModule } from 'modules';
import { ShareModule } from 'components';
import { AppsRoutingModule } from './apps.routes';
import { ManageAppsComponent } from './pages';

import { DateValueValidator } from '../../components/form/validator/date-validator.directive';
import { FormValidatorModule } from '../../components/form/validator/form-validator.module';
import { APP_SHARED_COMPONENTS } from 'features/apps/components';
import { AppDetailComponent } from 'features/apps/pages/detail';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShareModule,
    AppsRoutingModule,
    NguiAutoCompleteModule,
    FormValidatorModule
  ],
  declarations: [
    AppDetailComponent,
    ManageAppsComponent,
    ...APP_SHARED_COMPONENTS
  ],
  exports: [
    AppDetailComponent,
    ManageAppsComponent,
    ...APP_SHARED_COMPONENTS
  ]
})
export class AppsModule { }
