import {
    Directive, ElementRef, forwardRef,
    HostListener, Input, Renderer, OnInit, AfterViewInit, SimpleChanges, OnChanges,
} from '@angular/core';
import {
    NgControl,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { FormActions } from 'state';

@Directive({
    selector: '[formState]'
})
export class FormStateDirective implements OnChanges, OnInit {

    @Input() formState: string;
    @select(['form', 'isSubmitting']) isSubmitting$: Observable<boolean>;
    private textBoxTypes = ['text', 'textarea', 'editor'];
    private isSubmitting: boolean = false;
    constructor (
        private el: ElementRef,
        private render: Renderer,
        private control: NgControl,
        private formActions: FormActions) {
            this.isSubmitting$.subscribe(isSubmitting => this.isSubmitting = isSubmitting);
        }

    ngOnInit() {
        this.control.control.statusChanges.subscribe(status => {
            if(this.isSubmitting) {
                this.updateState();
            }
        });
    }
    ngOnChanges(changes: SimpleChanges) {}

    @HostListener('change')
    onChange(): void {
        const { type: inputType } = this.el.nativeElement;
        if(this.textBoxTypes.indexOf(inputType) === -1) {
            this.updateState();
        }
    }

    private updateState() {
        const formVal = this.control.value;
        this.formActions.updateFormControlByKey(this.formState, formVal, {
            ...this.control.errors,
            invalid: this.control.invalid
        });
    }

    @HostListener('click', ['$event'])
    onFocus(event) {
        if(this.isSubmitting) {
            this.formActions.updateExtraField({
                isSubmitting: false
            });
        }
    }

    /**
     * Whenever user lost focus of input then form
     * will be update {values} and {errors}
     *
     * FIXME: Do for array field type and deep nested field type.
     *
     * @param {any} event
     *
     * @memberOf FormStateDirective
     */
    @HostListener('focusout', ['$event'])
    onFocusout(event) {
        const inputType = this.el.nativeElement.getAttribute('type');
        if(this.textBoxTypes.indexOf(inputType) >= 0) {
            if(this.control.dirty) {
                this.updateState();
            }
        }
    }
};
