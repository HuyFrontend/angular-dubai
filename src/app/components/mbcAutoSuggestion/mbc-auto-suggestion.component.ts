import {
    Component, OnInit, OnChanges, SimpleChanges, ElementRef,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'auto-suggestion',
    templateUrl: 'mbc-auto-suggestion.html',
    styleUrls: ['mbc-auto-suggestion.scss'],
    host: {
        '(document:click)': 'handleClick($event)',
    }
})
export class MBCAutoSuggestion {
    public query = '';
    @Input('source') source: any;
    @Input('remote') remote: boolean = false;
    @Input('form-field-name') formFieldName: FormControl;
    @Input('place-holder') placeholderText: string = '';
    @Input('min-chars') minChars: number = 1;
    @Input('accept-user-input') acceptUserInput: boolean = false;
    @Input('inline-mode') inlineMode: boolean = false;
    @Input('no-match-found-text') noMatchFoundText: string = 'No Result Found';
    @Input() ngModel: string;

    @Output() valueSelected = new EventEmitter<any>();
    @Output() listSelected = new EventEmitter<any>();
    @Output() remoteSuggest= new EventEmitter<any>();

    public filteredList = [];
    public selected = [];
    public elementRef;
    selectedIdx: number;

    private updateEvent: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

    constructor(myElement: ElementRef) {
        this.elementRef = myElement;
        this.selectedIdx = -1;
        // Listen when data changed.
        this.updateEvent.subscribe(data=> {
            this.filteredList = data;
        });

    }

    ngOnInit() {
        this.bindStateToForm();
    }

    bindStateToForm() {
        if (!this.formFieldName) return false;
        this.selected = this.source.filter((el) => {
            let isExist = false;
            if (this.formFieldName.value) {
                this.formFieldName.value.forEach(item => {
                    if (el.id === item) {
                        isExist = true;
                    }
                });
            }

            return isExist;
        });
    }

    filter = (event: any) => {
      if(this.query && this.query.length >= this.minChars) {
        if(this.remote) {
            this.remoteSuggest.emit({val: this.query, updateEvent: this.updateEvent})
        } else {
            this.filteredList = this.source.filter((el) => {
                return (el.value.toLowerCase().indexOf(this.query.toLowerCase()) > -1
                    && !this.isSelected(el.value.toLowerCase())
                );
            });
        }
      } else {
        this.filteredList = [];
      }
    }

    closeNotFound = () => {
        this.filteredList = [];
        this.query = '';
    }

    isSelected = (query) => {
        let isExist = false;
        this.selected.map((el) => {
            if (el.value === query) {
                isExist = true;
            }
            return el;
        });
        return isExist;
    }

    select = (item) => {
        let isExist = false;

        this.selected.map((el) => {
            if (el.value.toLowerCase() == item.value.toLowerCase()) {
                isExist = true;
            }
            return el;
        });

        if (!isExist) {
            this.selected.push(item);
        }

        this.query = '';
        this.filteredList = [];

        // emit event to parent component
        this.valueSelected.emit(item);
        this.listSelected.emit(this.selected);

        // reactive form
        let rawData = this.selected.map(item => {
            return item.id
        });
        if ( this.formFieldName instanceof FormControl ) {
          this.formFieldName.setValue(rawData, { emitModelToViewChange: true });
        }
    }

    selectOne = () => {
        this.select(this.filteredList[this.selectedIdx]);
    }

    addNewOne = (query) => {
        const item = {
            id: this.source.length + 1,
            value: query
        }
        this.selected.push(item);
        this.query = '';
        this.filteredList = [];
        // emit event to parent component
        this.valueSelected.emit(item);
        this.listSelected.emit(this.selected);
    }

    handleBlur = () => {
        if (this.selectedIdx > -1) {
            this.query = this.filteredList[this.selectedIdx];
        }
        this.filteredList = [];
        this.selectedIdx = -1;
    }

    handleClick = (event) => {
        var clickedComponent = event.target;
        var inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);
        if (!inside) {
            this.filteredList = [];
        }
        this.selectedIdx = -1;
    }

    remove = (item) => {
        let itemIdx = this.selected.indexOf(item);
        this.selected.splice(itemIdx);
        this.listSelected.emit(this.selected);

        // reactive form
        let rawData = this.selected.map(item => {
            return item.id
        });
        if (this.formFieldName) this.formFieldName.setValue(rawData, { emitModelToViewChange: true });
    }

    clear = () => {
      this.selected = [];
      this.query = '';
    }

    inputElKeyHandler = (event: any) => {
        switch (event.keyCode) {
            case 27: // ESC, hide auto complete
                break;

            case 38: // UP, select the previous li el
                if (this.selectedIdx > 0) {
                    this.selectedIdx--;
                } else {
                    this.selectedIdx = 0;
                };
                break;

            case 40: // DOWN, select the next li el or the first one
                if (this.selectedIdx < this.filteredList.length - 1) {
                    this.selectedIdx++;
                } else {
                    this.selectedIdx = this.filteredList.length - 1;
                }
                break;
            case 9: // TAB,
            case 13: { // ENTER, choose it!!
                if (!this.acceptUserInput) {
                  if(this.selectedIdx < 0) {
                    this.selectedIdx = 0;
                  }
                  if(this.filteredList.length) {
                    this.selectOne()
                  }
                } else {
                    if (this.query) this.addNewOne(this.query);
                }
                event.preventDefault();
                break;
            }

            case 8: //BACK
                if (this.selected.length > 0) {
                  const itemToRemove = this.selected[this.selected.length - 1];
                  this.remove(itemToRemove);
                }
              break;
        }
    };
}
