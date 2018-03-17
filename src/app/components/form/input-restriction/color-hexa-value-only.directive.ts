import { Directive, forwardRef, ElementRef, HostListener } from '@angular/core';
import { NG_VALIDATORS, FormControl, AbstractControl, Validator, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


const COLOR_HEXA_VALUE_ACCESSOR_PROVIDER = [
  {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorHexaValueOnlyDirective), multi: true}
];

@Directive({
  selector: 'input[color-hexa-value-only]',
  providers: [COLOR_HEXA_VALUE_ACCESSOR_PROVIDER]
  // host: { 'change': 'onInputChange($event)' }
})
export class ColorHexaValueOnlyDirective implements ControlValueAccessor{
  constructor(private elementRef: ElementRef) {
    this.elementRef.nativeElement.setAttribute('maxlength', 7);
  }
  private onChange: Function;

  writeValue(str: any): void {
    this.elementRef.nativeElement.value = this.format(str || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}

  @HostListener('input', ['$event'])
  onInputChange($event){
    let inputValue = (<HTMLInputElement>event.currentTarget).value.trim();
    const formattedInputValue = this.format(inputValue);
    this.elementRef.nativeElement.value = formattedInputValue;

    this.onChange(formattedInputValue);
  }

  format(str: String){
    str = str.replace(/[^0-9a-fA-F]/g, '');
    return str.length > 0 ? '#' + str : '';
  }
}
