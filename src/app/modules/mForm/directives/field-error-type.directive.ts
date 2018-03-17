import {
    Renderer,
    Directive, ElementRef, Input, TemplateRef
} from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { getValueByPath, toogleDisplay } from '../utils';

@Directive({ selector: '[fieldErrorType]' })
export class FieldErrorTypeDirective {
    @Input() fieldErrorPath: string;
    @Input() idx: number;
    @Input() fieldErrorType: string;
    @Input() fieldError: string;

    @select(['form', 'errors']) formState$: Observable<any[]>;

    constructor (private renderer: Renderer, private el: ElementRef) {  
        // do something here
        toogleDisplay(this.el, false);
        this.formState$.subscribe(state => {
            this.registerOnErrorsChange(state);
        });
    }

    private registerOnErrorsChange(state: any): void {
        if(state) {
            let isDisplayError = false;
            if(!this.fieldErrorPath) {
                if(state[this.fieldError] && state[this.fieldError][this.fieldErrorType]) {
                    isDisplayError = true;
                }
            } else {
                const parentValues = getValueByPath(state, this.fieldErrorPath);
                if(this.idx !== undefined && parentValues) {
                    const fieldAtIdx = parentValues[this.idx];
                    if(fieldAtIdx) {
                        const errorAtField = fieldAtIdx[this.fieldError];
                        if(errorAtField) {
                            if(errorAtField[this.fieldErrorType]) {
                                isDisplayError = true;
                            }
                        }
                    }
                }
            }
            toogleDisplay(this.el, isDisplayError);
        }
    }
};