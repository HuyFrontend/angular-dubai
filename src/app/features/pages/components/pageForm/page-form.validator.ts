import { Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';

/**
 * 
 * 
 * @export
 * @param {RegExp} nameRe
 * @returns {ValidatorFn}
 */
export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const name = control.value;
    const no = nameRe.test(name);
    return no ? { forbiddenName: name } : null
  };
}

/**
 * Validate customURL in server.
 * 
 * @export
 * @returns {ValidatorFn}
 */
export function validCustomURL(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const { value: controlVal } = control;
    const isValid = true;
    return isValid ? { customURL: controlVal } : null
  };
}

/**
 * Validate customURL in server.
 * 
 * @export
 * @returns {ValidatorFn}
 */
export function notNull(control: AbstractControl): {[key: string]: any} | null {
  const { value: controlVal } = control;

    return controlVal == null ? { required: controlVal } : null;
}

/**
 * If {pageType} matchs then validate.
 * 
 * @export
 * @returns {ValidatorFn}
 */
export const validBaseOnType = (pageType:string) => (control: AbstractControl): {[key: string]: any} | null => {
  if(pageType === '1') {
    const { value: controlVal } = control;

    return controlVal == null ? { required: controlVal } : null;
  }
}