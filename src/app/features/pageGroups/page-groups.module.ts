import { NgModule } from '@angular/core';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { MFormModule } from 'modules';
import { ColorPickerModule } from 'primeng/primeng';

import { ShareModule } from 'components';
import { PageService } from 'services';
import { PageActions } from 'state';

import { PagesRoutingModule } from './page-groups.routes';
import { PageGroupComponent } from './page-groups.component'
import { GroupCreateComponent } from './group-create.component'
import { GroupDetailComponent } from './group-detail.component'
import { FormValidatorModule } from '../../components/form/validator/form-validator.module';
@NgModule({
  imports: [
    PagesRoutingModule,
    MFormModule,
    NguiAutoCompleteModule,
    ShareModule,
    ColorPickerModule,
    FormValidatorModule
  ],
  declarations: [
      GroupCreateComponent,
      PageGroupComponent,
      GroupDetailComponent
  ]
})
export class PageGroupsModule {
  constructor(private pageActions: PageActions) {
        this.pageActions.fetchConfigByTypes();
  }
}
