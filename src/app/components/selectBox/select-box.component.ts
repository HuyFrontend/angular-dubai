import {
    Component, OnInit, OnChanges, SimpleChanges, ElementRef,
    Input,
    HostListener,
    Output,
    EventEmitter
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'mbc-select-box',
    template: `
        <div [class.disabled]="disable" class="btn-group bootstrap-select form-control select mbc-selectbox">
            <button (click)="onOpen()" title="{{displayText}}"
                type="button" class="btn dropdown-toggle selectpicker btn-default">
                <span class="filter-option pull-left">{{ displayText }}</span>&nbsp;
                <span class="caret"></span>
            </button>
            <div *ngIf="isOpen" class="dropdown-menu open">
                <ul class="dropdown-menu inner selectpicker">
                    <li *ngFor="let item of dataSource" [class.selected]="isSelected(item)">
                        <a (click)="onSelect(item)">
                            <span class="text">{{ item[display] }}</span>
                            <i class="glyphicon glyphicon-ok icon-ok check-mark"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `
})

export class MBCSelectBoxComponent implements OnInit, OnChanges {

    @Input() isSingle: boolean = false;
    @Input() disable: boolean = false;
    @Input() fControl: FormControl;
    @Input() dataSource: any[];

    @Input() key: string;
    @Input() display: string;

    @Output() onSelectedItem = new EventEmitter<any>();
    @Output() onUnSelectedItem = new EventEmitter<any>();

    public isOpen: boolean = false
    public formGroup: FormGroup;
    public displayText: string = '';

    constructor(private _elementRef : ElementRef) {
        this.dataSource = [];
    }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        this.init();
    }

    isSelected(item: any) {
        const selectedItems: any[] = this.fControl.value;
        if(selectedItems) {
            const foundItem = selectedItems.find(x=> x[this.key] == item[this.key]);
            if(foundItem) return true;
        }
        return false;
    }

    onSelect(item){
        this.onSelectedItem.emit(item);
        this.isOpen = false;
        const currentVal = this.fControl.value || [];
        currentVal.push(item);
        this.setInputVal(currentVal);
    }

    init() {        
        if(this.fControl) {            
            this.setInputVal(this.dataSource);
            this.fControl.valueChanges.subscribe(obj=> {
                this.setInputVal(obj);
            });
        }
    }

    setInputVal(obj: any[]) {
        let displayName = '';
        if(obj) {
            obj.map((curr, idx, arr) => {
                if(!displayName)
                    displayName = curr[this.display];
                else 
                    displayName = displayName + ', ' + curr[this.display];
            })
        }
        this.displayText = displayName;
    }

    onOpen() {
        if(!this.disable && this.dataSource.length > 0)
        {
            this.isOpen = true;
        }
    }

    @HostListener('document:click', ['$event.target'])
    onFocusOut(targetElement) {
        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.isOpen = false;
        }
    }
}