import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[only-number]'
})
export class OnlyNumberDirective {

  private isCmdPressed: boolean = false;

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    if (event.key === 'Meta') {
      this.isCmdPressed = true;
      return;
    }

    // Allow: Cmd+A, Cmd+C, Cmd+X
    if (this.isCmdPressed && [65, 67, 88].indexOf(event.keyCode) !== -1) {
      return;
    }

    if ([46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (event.keyCode == 65 && event.ctrlKey === true) ||
      // Allow: Ctrl+C
      (event.keyCode == 67 && event.ctrlKey === true) ||
      // Allow: Ctrl+X
      (event.keyCode == 88 && event.ctrlKey === true) ||
      // Allow: home, end, left, right
      (event.keyCode >= 35 && event.keyCode <= 39 && event.keyCode != 38)) {
        // let it happen, don't do anything
        return;
      }


    // Ensure that it is a number and stop the keypress
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }

  @HostListener('keyup', ['$event']) onKeyUp(event) {
    if (event.key === 'Meta') {
      this.isCmdPressed = false;
    }
  }
}
