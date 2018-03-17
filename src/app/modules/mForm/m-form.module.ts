import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    // FormsModule,
    ReactiveFormsModule
} from '@angular/forms';

import { SHARED_DIRECTIVES } from './directives';
import { SHARED_COMPONENTS } from './components';

@NgModule({
  imports: [
    CommonModule,
    // FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
      ...SHARED_COMPONENTS,
      ...SHARED_DIRECTIVES
  ],
  exports: [
      ...SHARED_COMPONENTS,
      ...SHARED_DIRECTIVES
  ]
})
export class MFormModule { }
