import {
  Component, OnInit, OnChanges,
  SimpleChanges, ElementRef, forwardRef,
  Input, Output, ChangeDetectorRef,
  HostListener, EventEmitter
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DEBOUNCE_TIME } from 'configs';

export const EDITOR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SingleSuggestionComponent),
  multi: true
};

@Component({
  selector: 'single-suggestion',
  template: `
    <div [formGroup]="formGroup" class="suggestion-container single-suggestion">
      <input
        [readOnly] = "isReadOnly"
        type="text"
        maxlength="250"
        class="validate filter-input form-control"
        formControlName="autoSuggestion"
        autocomplete="off"
        placeholder="{{ placeholder }}"
        (focus)="onFocus($event)"
        (focusout)="onFocusOutInput($event)"
        (keydown)=inputElKeyHandler($event)
      />
      <div *ngIf="isOpenSuggestion" class="suggestions open">
        <ul class="list-items">
          <li *ngIf="suggestions.length === 0" class="no-found-record">No record found.</li>
          <li *ngFor="let item of suggestions; let i = index" [class.selected]="selectedIdx === i">
            <a (click)="itemSelected(i)">
                <span class="text">{{ item[display] }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  `,
  providers: [EDITOR_VALUE_ACCESSOR]
})
export class SingleSuggestionComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input() selectedValue?: any = null;
  @Input() suggestionList?: any[] = [];
  @Input() isReadOnly: string = null;
  @Input() placeholder: string;
  // pairs key-value to get/set.
  @Input() display: string;
  @Input() key: string;
  @Input('accept-user-input') acceptUserInput: boolean = true;

  @Output() onClosed = new EventEmitter<any>();
  @Output() onSelectedChanged = new EventEmitter<any>();
  @Output() onRemoveItem = new EventEmitter<any>();
  @Output() onQuery = new EventEmitter<any>();

  public formGroup: FormGroup;
  public suggestions: any[];
  public isOpenSuggestion: boolean = false;
  public selectedIdx: number = -1;

  private isTextChanged: boolean = false;
  private updateEvent: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor (
    private el: ElementRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.suggestions = [];
    this.isOpenSuggestion = false;
    this.init();
  }

  value: string;

  onModelChange: Function = () => { };

  onModelTouched: Function = () => { };

  writeValue(value: any): void {
    this.value = value;
    this.setInputVal(value);
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }
  private _isFirstTimeUpdateEvent = false;
  ngOnInit() {
    this.updateEvent.subscribe(data => {
      if (!this._isFirstTimeUpdateEvent) {
        this._isFirstTimeUpdateEvent = true;
        this.isOpenSuggestion = false;
      } else {
        this.isOpenSuggestion = true;
      }
      this.suggestions = data;
      this.changeDetectorRef.detectChanges();
    });
  }
  /**
   * Init controls then bind data to.
   *
   *
   * @memberOf SingleSuggestionComponent
   */
  init() {
    if (!this.formGroup) {
      const autoSuggestion = new FormControl('');
      autoSuggestion.valueChanges
        .debounceTime(DEBOUNCE_TIME)
        .do(val => {
          this.value = null;
          this.isTextChanged = true;
          if (val.trim().length > 0) {
            if (this.suggestionList.length) {
              const formatSuggestionList = this.formatSuggestionList(
                this.suggestionList.filter(item => {
                  const value = item.names ? item.names[0].text : '';
                  return value.toLowerCase().indexOf(val.toLowerCase()) > -1;
                })
              );
              this.updateEvent.next(formatSuggestionList);
            } else {
              this.onQuery.emit({ val, updateEvent: this.updateEvent });
            }
          } else {
            this.updateEvent.next([]);
          }
        })
        .subscribe();
      this.formGroup = new FormGroup({ autoSuggestion });
    }
  }

  formatSuggestionList(arrData: any[]) {
    return arrData.map(item => {
      const value = item.names ? item.names[0].text : '';
      const objData = {
        id: item.code,
        names: value,
        raw: item
      };
      return objData;
    });
  }

  onFocus = (e) => e.target.select();

  /**
   * Set display text into Input Textbox
   *
   * @param {*} obj
   *
   * @memberOf SingleSuggestionComponent
   */
  setInputVal(obj: any) {
    const displayVal = obj ? obj[this.display] : ''
    this.formGroup.controls.autoSuggestion.setValue(displayVal, { onlySelf: true, emitEvent: false });
  }

  /**
   * When item was selected then set display value on Input
   * then fired {onSelectedChanged} event.
   *
   * @param {*} item
   *
   * @memberOf SingleSuggestionComponent
   */
  onSelect(item: any) {
    this.selectedIdx = -1;
    this.value = item;
    this.setInputVal(item);
    this.isOpenSuggestion = false;
    this.onModelChange(this.value);
    this.isTextChanged = false;
    if (this.onSelectedChanged) this.onSelectedChanged.emit(this.value);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.selectedValue) {
      this.selectedIdx = -1;
      this.value = this.selectedValue;
      this.setInputVal(this.selectedValue);
      this.onModelChange(this.value);
      this.isTextChanged = false;
    }
  }

  itemSelected(selectedIdx: number) {
    this.selectedIdx = selectedIdx;
    this.onSelect(this.suggestions[this.selectedIdx]);
    this.isTextChanged = false;
    if (this.onClosed) this.onClosed.emit(this.value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event) {
    const clickedInside = this.el.nativeElement.contains(event.target);
    this.isOpenSuggestion = false;
    if (!clickedInside && this.isTextChanged) {
      this.isTextChanged = false;
      if (this.onClosed) this.onClosed.emit(this.value);
    }
  }

  onFocusOutInput($event) {
    this.onModelChange(this.value);
    if (!this.acceptUserInput) {
      const text = $event.target.value;
      if (!text || !this.containsValue(text)) {
        this.setInputVal(this.value);
      }
    }
    if (this.onSelectedChanged) this.onSelectedChanged.emit(this.value);
  }

  inputElKeyHandler = (event: any) => {
    switch (event.keyCode) {
      case 27: // ESC, hide auto complete
        break;

      case 38: // UP, select the previous li el
        if (this.selectedIdx > 0) {
          this.selectedIdx--;
        } else {
          this.selectedIdx = this.suggestions.length - 1;
        };
        break;

      case 40: // DOWN, select the next li el or the first one
        if (this.selectedIdx < this.suggestions.length - 1) {
          this.selectedIdx++;
        } else {
          this.selectedIdx = 0;
        }
        break;

      case 9:
      case 13: // ENTER, choose it!!
        if (!this.acceptUserInput && this.selectedIdx < 0 && this.suggestions.length) {
          this.selectedIdx = 0;
        }
        this.onSelect(this.suggestions[this.selectedIdx]);
        this.isTextChanged = false;
        if (this.onClosed) this.onClosed.emit(this.value);
        break;
    }
  };

  private containsValue(text): boolean {
    for (let i = 0; i < this.suggestions.length; i++) {
      if (text === this.suggestions[i].display) {
        return true;
      }
    }
    return false;
  }
}
