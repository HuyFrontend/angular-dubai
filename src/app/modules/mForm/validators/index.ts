import { Validators, AbstractControl, ValidatorFn } from '@angular/forms';

function notEmpty(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        const { value: controlVal } = control;
        let isValid = false;
        if(controlVal) {
            if(typeof controlVal == 'string' 
                && controlVal.trim().length > 0)
            {
                isValid = true;
            }
        }
        return isValid ? null : { required: true };
    };
}

function emptyObject(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        const { value: controlVal } = control;
        let isValid = false;
        if(controlVal) {
            if(typeof controlVal === 'object')
            {
                isValid = true;
            }
        }
        return isValid ? null : { required: true };
    };
}
export {
    notEmpty,
    emptyObject
}