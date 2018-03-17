import {ControlValueAccessor, FormControl} from '@angular/forms';
import {
  Input, Output, EventEmitter
} from '@angular/core';

export abstract class ValueAccessorBase<T> implements ControlValueAccessor {
  @Input () parentControl: FormControl;
  @Output() handleDataChanges = new EventEmitter<any>();
  private innerValue: T;

  private changed = new Array<(value: T) => void>();
  private touched = new Array<() => void>();

  get value(): T {
    return this.innerValue;
  }

  set value(value: T) {
    if (this.isChanged(value)) {
      this.writeValue(value);
      this.changed.forEach(f => f(this.innerValue));
      this.handleDataChanges.emit(this.innerValue);
    }
  }

  isChanged(value: T): boolean {
    return this.innerValue !== value
  }

  writeValue(value: T) {
    this.innerValue = value;
  }

  registerOnChange(fn: (value: T) => void) {
    this.changed.push(fn);
  }

  registerOnTouched(fn: () => void) {
    this.touched.push(fn);
  }

  touch() {
    this.touched.forEach(f => f());
  }
}