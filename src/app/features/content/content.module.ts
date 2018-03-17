import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { EditorModule, SharedModule, DragDropModule, AutoCompleteModule } from 'primeng/primeng';
import * as Quill from 'quill';

import { MFormModule } from 'modules';
import { ShareModule } from 'components';
import { ContentRoutingModule } from './content.routes';
import { CONTENT_SHARED_COMPONENTS } from './components';
import { CONTENT_PAGES_COMPONENT } from './pages';
import { FocusParagraphDirective } from './directives/focus-paragraph.directive';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ShareModule,
    ReactiveFormsModule,
    ContentRoutingModule,
    NguiAutoCompleteModule,
    EditorModule,
    SharedModule,
    MFormModule,
    DragDropModule,
    AutoCompleteModule
  ],
  declarations: [
    FocusParagraphDirective,
    ...CONTENT_PAGES_COMPONENT,
    ...CONTENT_SHARED_COMPONENTS
  ],
  exports: [
    ...CONTENT_SHARED_COMPONENTS
  ]
})
export class ContentModule { }
