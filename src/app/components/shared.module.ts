import { DragulaModule } from 'ng2-dragula';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { MyDatePickerModule } from 'mydatepicker';
import { PopoverModule, CollapseModule, TabsModule, TooltipModule, ModalModule } from 'ngx-bootstrap';
import { GrowlModule, EditorModule, SharedModule } from 'primeng/primeng';
import { DpDatePickerModule } from 'ng2-date-picker';
// import our custom modules
import { SHARE_COMPNENTS } from './shared-components';
import { COMMON_PIPES } from '../pipes';
import { CLOUDINARY } from 'constant';

import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule, CloudinaryConfiguration, provideCloudinary } from '@cloudinary/angular-4.x';
import { FileUploadModule } from 'ng2-file-upload';

export const cloudinaryLib = {
  Cloudinary: Cloudinary
};

/**
 * Define all global modules/components/directives/pipes for whole project.
 *
 * @export
 * @class ShareModule
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,
        MyDatePickerModule,
        GrowlModule,
        ModalModule,
        ModalModule.forRoot(),
        CollapseModule.forRoot(),
        PopoverModule.forRoot(),
        TabsModule.forRoot(),
        TooltipModule.forRoot(),
        DragulaModule,
        SharedModule,
        EditorModule,
        DpDatePickerModule,
        FileUploadModule,
        CloudinaryModule.forRoot(cloudinaryLib,
            <CloudinaryConfiguration> {
              cloud_name: CLOUDINARY.CLOUD_NAME
            })
    ],
    declarations: [
        SHARE_COMPNENTS,
        COMMON_PIPES,
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        PopoverModule,
        CollapseModule,
        TabsModule,
        TooltipModule,
        ModalModule,
        DragulaModule,
        FileUploadModule,

    ...SHARE_COMPNENTS,
    ...COMMON_PIPES,
  ]
})
export class ShareModule { }
