import {
    Directive, HostListener, Input, Output, EventEmitter
} from '@angular/core';
import {
    NgControl
} from '@angular/forms';

@Directive({ 
    selector: '[trim-value], [trim-value][ngModel]' 
})
export class TrimValueDirective {
    @HostListener('blur', ['$event'])
    onBlur(event: any) {
        if (event && event.target && event.target.value) {
            event.target.value = event.target.value.trim();
        }
    }
};