import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, FormControl, AbstractControl, Validator } from '@angular/forms';


@Directive({
  selector: '[nospace][formControlName], [nospace][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NoSpaceValidator), multi: true }
  ]
})
export class NoSpaceValidator implements Validator {

  constructor() {
  }
  validate = (control: AbstractControl): { [s: string]: boolean } => {
    if (control.value && control.value.trim() === '') {
      return { required: true };
    }
  }
}
