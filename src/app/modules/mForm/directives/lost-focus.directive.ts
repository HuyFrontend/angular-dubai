import {
    Directive, HostListener, Input, Output, EventEmitter
} from '@angular/core';
import {
    NgControl
} from '@angular/forms';

@Directive({ selector: '[onLostFocus]' })
export class LostFocusDirective {

    @Output() onLostFocus = new EventEmitter<any>();

    constructor (private control: NgControl)
    {
            // do something here
    }

    // Check focusout of input then update value on form state.
    @HostListener('focusout', ['$event'])
    onFocusout(event: any) {
        this.onLostFocus.emit({ target: event.target, val: this.control.value });
    }
};