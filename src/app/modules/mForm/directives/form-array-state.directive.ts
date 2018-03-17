import {
    Directive, ElementRef, OnInit, OnChanges,
    HostListener, Input, SimpleChanges,
    ViewContainerRef, TemplateRef
    
} from '@angular/core';
import {
    NgControl
} from '@angular/forms';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { FormActions } from 'state';

@Directive({ selector: '[formArrayState]' })
export class FormArrayStateDirective implements OnInit {

    @select(['form', 'isSubmitting']) isSubmitting$: Observable<boolean>;
    private textBoxTypes = ['text', 'textarea'];
    private isSubmitting: boolean = false;

    @Input() idx: number;
    @Input() idxField: string;
    @Input() formArrayState: string;

    constructor (
        private el: ElementRef,
        private control: NgControl,
        private formActions: FormActions
        )
         {  
            // do something here
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

    @HostListener('click', ['$event'])
    onFocus(event) {
        if(this.isSubmitting) {
            this.formActions.updateExtraField({
                isSubmitting: false
            });
        }
    }

    private updateState() {
        this.formActions.updateFormArrayByIdx(
            this.formArrayState,
            this.idx, 
            {
                propertyKey: this.idxField,
                propertyValue: this.control.control.value,
                propertyState: this.control.control.errors
            });
    }
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