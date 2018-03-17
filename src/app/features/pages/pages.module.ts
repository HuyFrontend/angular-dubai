import { GLOBAL_APP_DIRECTIVES } from 'directives';
import { NgModule } from '@angular/core';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { MFormModule } from 'modules';
import { ColorPickerModule } from 'primeng/primeng';

import { ShareModule } from 'components';
import { PageService } from 'services';
import { PageActions } from 'state';

import { PagesRoutingModule } from './pages.routes';
import { PAGE_COMPONENTS } from './pages';
import { PAGE_SHARED_COMPONENTS } from './components';

@NgModule({
  imports: [
    PagesRoutingModule,
    MFormModule,
    NguiAutoCompleteModule,
    ShareModule,
    ColorPickerModule,
  ],
  declarations: [
    ...GLOBAL_APP_DIRECTIVES,
    ...PAGE_SHARED_COMPONENTS,
    ...PAGE_COMPONENTS,
  ]
})
export class PagesModule {
  constructor(private pageActions: PageActions) {
        this.pageActions.fetchConfigByTypes();
  }
}
