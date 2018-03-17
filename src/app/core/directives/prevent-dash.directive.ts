import {
    Directive, HostListener, Input, Output, EventEmitter
} from '@angular/core';
import {
    NgControl
} from '@angular/forms';

@Directive({ 
    selector: '[prevent-dash], [prevent-dash][ngModel]' 
})
export class PreventDashDirective {
    @HostListener('keydown', ['$event'])
    onKeyDown(event: any) {
        if (event.keyCode === 189) {
          	event.preventDefault();
        }
    }
};