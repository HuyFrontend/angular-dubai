import { AbstractControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { DEBOUNCE_TIME } from 'configs';
import { ContentService } from 'services';

export const registerUniqueValidator = (contentService: ContentService,
    control: AbstractControl,
    bindingPath: string,
    shouldCheck: Function) => {
    control.valueChanges
        .filter(val => val.length >= 2)
        .debounceTime(DEBOUNCE_TIME)
        .switchMap(val => {
            if (shouldCheck()) {
                return contentService.checkExist(bindingPath, val);
            } else {
                return Observable.of({'result': false});
            }
        })
        .subscribe((data) => {
            if (data.result && control.valid) {
                control.setErrors({ existValue: true });
            } else {
                control.setErrors(null);
            }
        });
}

export const nospaceValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (control.value && control.value.trim() === '') {
        return { nospace: true };
    }
};