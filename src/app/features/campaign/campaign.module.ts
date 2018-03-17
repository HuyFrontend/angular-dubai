import { AsyncExistValidator } from './../../components/form/validator/async.exist-validator.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import * as Quill from 'quill';

import { MFormModule } from 'modules';
import { ShareModule } from 'components';
import { CAMPAIGN_SHARED_COMPONENTS } from './components';
import { CampaignRoutingModule } from './campaign.routes';
import { CampaignDetailComponent, ManageCampaignComponent } from './pages';
import { DateValueValidator } from '../../components/form/validator/date-validator.directive';
import { FormValidatorModule } from '../../components/form/validator/form-validator.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShareModule,
    CampaignRoutingModule,
    NguiAutoCompleteModule,
    FormValidatorModule
  ],
  declarations: [
    DateValueValidator,
    CampaignDetailComponent,
    ManageCampaignComponent,
    ...CAMPAIGN_SHARED_COMPONENTS
  ],
  exports: [
    CampaignDetailComponent,
    ManageCampaignComponent,
    ...CAMPAIGN_SHARED_COMPONENTS
  ]
})
export class CampaignModule { }
