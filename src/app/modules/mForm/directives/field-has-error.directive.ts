import {
    Renderer,
    Directive, ElementRef, Input, TemplateRef
} from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { getValueByPath, toogleDisplay } from '../utils';

@Directive({ selector: '[fieldHasError]' })
export class FieldHasErrorDirective {

    @Input() fieldErrorPath: string;
    @Input() idx: number;
    @Input() fieldHasError: string;

    @select(['form', 'errors']) formState$: Observable<any[]>;

    private fieldErrorType: string = 'invalid';
    constructor (private renderer: Renderer, private el: ElementRef) {  
        // do something here
        this.formState$.subscribe(state => {
            this.registerOnErrorsChange(state);
        })
    }

    private registerOnErrorsChange(state: any): void {
        if(state) {
            let isDisplayError = false;
            if(!this.fieldErrorPath) {
                if(state[this.fieldHasError] && state[this.fieldHasError][this.fieldErrorType]) {
                    isDisplayError = true;
                }
            } else {
                const parentValues = getValueByPath(state, this.fieldErrorPath);
                if(this.idx !== undefined && parentValues) {
                    const fieldAtIdx = parentValues[this.idx];
                    if(fieldAtIdx) {
                        const errorAtField = fieldAtIdx[this.fieldHasError];
                        if(errorAtField) {
                            if(errorAtField[this.fieldErrorType]) {
                                isDisplayError = true;
                            }
                        }
                    }
                }
            }
            if(isDisplayError) {
                this.renderer.setElementClass(this.el.nativeElement, 'has-error', true);
            } else {
                this.renderer.setElementClass(this.el.nativeElement, 'has-error', false);
            }
        }
    }
};