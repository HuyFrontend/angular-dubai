import {
    Directive, HostListener, Input, Output, EventEmitter, ElementRef, Renderer2
} from '@angular/core';

@Directive({
    selector: '[ngFocusParagraph]'
})
export class FocusParagraphDirective {
    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        elementRef.nativeElement.addEventListener('blur', this.focusOutListener, true);
        elementRef.nativeElement.addEventListener('focus', this.focusListener, true);
        elementRef.nativeElement.addEventListener('click', this.clickListener, true);
    }
    
    focusListener = (e) => {
        this.renderer.addClass(this.elementRef.nativeElement, 'focus-paragraph');
    };

    focusOutListener = (e) => {
        this.renderer.removeClass(this.elementRef.nativeElement, 'focus-paragraph'); 
    };

    clickListener = (e) => {
        const actives = document.getElementsByClassName('focus-paragraph')
        for (var i = 0; i < actives.length; i++) {
            this.renderer.removeClass(actives[i], 'focus-paragraph');
        }

        this.focusListener(e);
    }
};