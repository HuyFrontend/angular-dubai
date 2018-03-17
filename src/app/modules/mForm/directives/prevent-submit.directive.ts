import {
    Directive, HostListener, Input, Output, EventEmitter
} from '@angular/core';
import {
    NgControl
} from '@angular/forms';

@Directive({ selector: '[ngSubmit]' })
export class PreventSubmitDirective {
    @HostListener('keydown', ['$event'])
    onKeyDown(event: any) {
        if (event.keyCode == 13 && event.target && event.target.tagName !== 'TEXTAREA') {
          	event.preventDefault();
        }
    }
};
