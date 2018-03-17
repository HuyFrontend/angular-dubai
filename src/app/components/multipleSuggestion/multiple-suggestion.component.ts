import {
  Component, OnChanges, ChangeDetectorRef,
  Input, SimpleChanges, ElementRef,
  Output, HostListener, EventEmitter,
  ViewChild, OnInit, ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { DEBOUNCE_TIME } from 'configs';

@Component({
  selector: 'mbc-multiple-suggestion',
  templateUrl: 'multiple-suggestion.html',
  styleUrls: ['multiple-suggestion.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MBCMultipleSuggestionComponent implements OnChanges, OnInit {

  @Input() suggestionList?: any[] = [];
  @Input() isFilterDuplicated: boolean;
  @Input() placeholder: string;
  @Input() selectedValue: any[];

  // pairs key-value to get/set.
  @Input() display: string;
  @Input() key: string;

  @Input() isReadOnly: string = null;
  @Input() acceptUserInput: boolean = false;
  @Input() maxItem: number;

  @Output() onSelectedChanged = new EventEmitter<any>();
  @Output() onAddedItem = new EventEmitter<any>();
  @Output() onRemoveItem = new EventEmitter<any>();
  @Output() onQuery = new EventEmitter<any>();
  @ViewChild('inputTag') private _inputTagElement: ElementRef

  public suggestions: any[];
  public formGroup: FormGroup;
  public listSelected: any[];
  public isQuerying = false;
  public isOpenSuggestion = false;
  private _isFirstTimeUpdateEvent = false;
  public selectedIdx: number = -1;

  private updateEvent: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(private _elementRef: ElementRef, private changeDetectorRef: ChangeDetectorRef) {
    this.suggestions = [];
    this.listSelected = [];
    this.selectedValue = [];
    this.isFilterDuplicated = true;
    this.init();
  }

  ngOnInit() {
    this.updateEvent.subscribe(data => {
      if (!this._isFirstTimeUpdateEvent) {
        this._isFirstTimeUpdateEvent = true;
        this.isOpenSuggestion = false;
      } else {
        this.isOpenSuggestion = data !== undefined;
      }

      this.isQuerying = false;

      if(data !== undefined){
        if (this.isFilterDuplicated === true) {
          this.listSelected.forEach(element => {
            data = data.filter(x => x[this.key] != element[this.key]);
          });
        }
        this.suggestions = data;
      } else {
        this.suggestions = [];
      }

      this.changeDetectorRef.detectChanges();
    });
  }

  /**
   * Catch remove item event then do:
   *  - Update selected list item.
   *  - Emit {onRemoveItem} event
   *
   * @param {number} idx
   * @param {*} item
   *
   * @memberOf MBCMultipleSuggestionComponent
   */
  onRemove(idx: number, item: any): void {
    if (this.listSelected.length > 0) {
      this.listSelected = this.listSelected.filter(x => x[this.key] != item[this.key]);
      if (this.onRemoveItem) {
        this.onRemoveItem.emit(item);
      }
    }
  }

  /**
   * Catch on Item select event then do:
   *  - Update selected list.
   *  - Emit {onSelectedChanged} and {onAddedItem} events for parent to process something.
   *  - Reset value in input textbox.
   *
   * @param {*} item
   *
   * @memberOf MBCMultipleSuggestionComponent
   */
  onItemSelect(item: any): void {
    this.selectedIdx = -1;
    let isDuplicated = false;
    if (this.isFilterDuplicated === true) {
      let listDuplicatedSelected = this.listSelected.filter(x => x[this.key] == item[this.key]);
      isDuplicated = (listDuplicatedSelected && listDuplicatedSelected.length > 0);
    }
    if (!isDuplicated) {
      this.listSelected.push(item);
    }
    this.onSelectedChanged.emit(this.listSelected);
    this.onAddedItem.emit(item);
    this.isOpenSuggestion = false;
    this.formGroup.controls.autoSuggestion.setValue('', { onlySelf: true, emitEvent: false })
  }

  /**
   * Init controls & bind data
   *
   *
   * @memberOf MBCMultipleSuggestionComponent
   */
  init(): void {
    if (!this.formGroup) {
      const inputControl = new FormControl('');
      inputControl.valueChanges
        .debounceTime(DEBOUNCE_TIME)
        .do(val => {
          if (val.trim().length > 0) {
            this.isQuerying = true;
            this.isOpenSuggestion = true;
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
            this.updateEvent.next(undefined);
          }
        })
        .subscribe();
      this.formGroup = new FormGroup({ autoSuggestion: inputControl });
    }
  }

  formatSuggestionList(arrData: any[]) {
    return arrData.map(item => {
      const value = item.names ? item.names[0].text : '';
      const objData = {
        id: item.code,
        value,
        raw: item
      };
      return objData;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.selectedValue && this.selectedValue.length) {
      this.listSelected = [
        ...this.selectedValue
      ];

      if (this.listSelected.length === 0) {
        this.formGroup.controls.autoSuggestion.setValue('');
      }

      this.onSelectedChanged.emit(this.listSelected);
    } else {
      this.listSelected = [];
      this.formGroup.controls.autoSuggestion.setValue('');
    }

  }

  onInputFocus($event) {
    this._inputTagElement.nativeElement.focus();
  }

  /**
   * When focusout of element then close popup.
   * TODO: Should make a common.
   *
   * @param {any} targetElement
   *
   * @memberOf MBCMultipleSuggestionComponent
   */
  @HostListener('document:click', ['$event.target'])
  onDocumentClick(targetElement) {
    const clickedInside = this._elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.isOpenSuggestion = false;
    }
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

      case 13: // ENTER, choose it!!
        if (this.selectedIdx >= 0) {
          this.onItemSelect(this.suggestions[this.selectedIdx]);
        } else if(this.acceptUserInput){
          let queryText = this.formGroup.controls.autoSuggestion.value;
          queryText = queryText.trim();
          if(queryText){
            this.addNewItem(queryText);
          }
        }
        break;
      case 9: // TAB, choose if tab-to-select is enabled
        if (this.selectedIdx > -1) {
          this.onItemSelect(this.suggestions[this.selectedIdx])
        }
        break;
      case 8: //BACK
        if (this.formGroup.controls.autoSuggestion.value == '') {
          if (this.listSelected.length > 0) {
            const itemToRemove = this.listSelected[this.listSelected.length - 1];
            this.onRemoveItem.emit(itemToRemove);
            this.listSelected.pop();
          }
        }

        if (this.formGroup.controls.autoSuggestion.value.length < 2)
          this.isQuerying = true;
        break;
    }
  };

  addNewItem(value: string){
    this.selectedIdx = -1;
    this.isOpenSuggestion = false;

    //TODO As this is new item, should check if we have a good way fo checking duplicate here
    //For now (M3S1), we only create new item for a list of single item => no need check duplicate

    const newItem = {
      [this.key]: null, //TODO check if have a good way to handle key generation here
      [this.display]: value
    }

    this.listSelected.push(newItem);
    this.onSelectedChanged.emit(this.listSelected);
    this.onAddedItem.emit(newItem);
    this.formGroup.controls.autoSuggestion.setValue('', { onlySelf: true, emitEvent: false })
  }

  clear() {
    this.listSelected = [];
    this.selectedValue = [];
  }
}
