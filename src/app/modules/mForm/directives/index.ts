import { FormStateDirective } from './form-state.directive';
import { FormArrayStateDirective } from './form-array-state.directive';
import { LostFocusDirective } from './lost-focus.directive';
import { FieldErrorTypeDirective } from './field-error-type.directive';
import { FieldHasErrorDirective } from './field-has-error.directive';
import { PreventSubmitDirective } from './prevent-submit.directive';

const SHARED_DIRECTIVES = [
    FormStateDirective,
    FormArrayStateDirective,
    LostFocusDirective,
    FieldErrorTypeDirective,
    FieldHasErrorDirective,
    PreventSubmitDirective
]

export {
    FormStateDirective,
    FormArrayStateDirective,
    LostFocusDirective,
    FieldErrorTypeDirective,
    FieldHasErrorDirective,
    PreventSubmitDirective,
    SHARED_DIRECTIVES
}
