
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateValueValidator } from './date-validator.directive';
import { NoSpaceValidator } from './nospace-validator.directive';
import { AsyncExistValidator } from './async.exist-validator.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    NoSpaceValidator,
    AsyncExistValidator
  ],
  exports: [
    NoSpaceValidator,
    AsyncExistValidator
  ]
})
export class FormValidatorModule { }
