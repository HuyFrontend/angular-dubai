import {
  Component, OnInit, HostListener, ContentChildren, Input, Output, EventEmitter, QueryList, ViewChild, AfterViewInit
} from '@angular/core';
import {
  NgModel,
  NgForm,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { HeaderComponent } from './header'
import { ColumnComponent } from './column'
import { TableActionComponent } from './action'
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { ValueAccessorBase } from '../form';

// The sorting class of the Atlan template is reverted.
const SORTING_DESC = 'sorting_asc';
const SORTING_ASC = 'sorting_desc';

@Component({
  selector: 'data-table',
  templateUrl: 'dataTable.component.html',
  styleUrls: ['dataTable.component.scss'],
  providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: DataTableComponent,
		multi: true,
	}],
})

export class DataTableComponent extends ValueAccessorBase<any> {
  @ContentChildren(HeaderComponent) headers: QueryList<HeaderComponent>;
  @ContentChildren(ColumnComponent) columns: QueryList<ColumnComponent>;
  @ContentChildren(TableActionComponent) actions: QueryList<TableActionComponent>;

  @Input() records: Array<any> = [];
  @Input() loading: boolean = true;
  @Input('total-items') totalItems: number;
  @Input('has-more') hasMore: boolean = true;
  @Input('item-remove') itemRemove: boolean;
  @Input('item-up') itemUp: boolean;
  @Input('item-down') itemDown: boolean;
  @Input('item-default') itemDefault: boolean;
  @Input('display-loader') displayLoader: boolean;
  @Input('dragable') dragable: boolean = false;
  @Input('addNew') addNew: boolean = false;
  @Input('hideCheckbox') hideCheckbox: boolean = false;

  @Output() sort = new EventEmitter<any>();
  @Output() loadMore = new EventEmitter<any>();
  @Output() itemSelectChange = new EventEmitter<any>();
  @Output() selectboxChange = new EventEmitter<any>();
  @Output() removeItemHandler = new EventEmitter<any>();
  @Output() moveUpItemHandler = new EventEmitter<any>();
  @Output() moveDownItemHandler = new EventEmitter<any>();
  @Output() defaultItemHandler = new EventEmitter<any>();
  @Output() movedItemsHandler = new EventEmitter<any>();
  @Output() addNewHandler = new EventEmitter<any>();

  @Output() querySuggestion = new EventEmitter<any>();
  @Output() removeSuggestion = new EventEmitter<any>();
  @Output() addSuggestion = new EventEmitter<any>();

  @Output() querySingleSuggestion = new EventEmitter<any>();
  @Output() singleSuggestionChanged = new EventEmitter<any>();
  @Output() singleSugesstionClosed = new EventEmitter<any>();
  private orderDir: string = 'SORTING_DESC';
  private column: string = '';

  @HostListener('window:scroll', ['$event'])
  doScroll($event) {
    if (this.loading) return false;
    let curScrTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    let scrollHeight = document.body.scrollHeight;
    let winHeight = document.documentElement.clientHeight;
    if (scrollHeight - (curScrTop + winHeight) <= 100) {
      this.loadMore.emit($event);
    }
  }

  constructor(private dragulaService: DragulaService) {
    super();
    this.initOrder(this.records);
    dragulaService.drop.subscribe((value) => {
      const bagName = value[0];
      if(bagName == 'first-bag'){
        const changes = [];
        this.records.map((r, i) => {
          if(r.order !== i) {
            r.order = i;
            changes.push(r);
          }
        })
        if(changes.length) {
          this.movedItemsHandler.emit(changes);
        }
      }
    });
  }

  initOrder(records) {
    if(!this.records) return;
    this.records.map((r, i) => r.order = i);
  }

  getValue(data: any, path: string) {
    if(path){
       return path.split('.').reduce((o,i)=>o[i], data);
    }
  }

  doLoadMore($event) {
    this.loadMore.emit($event);
  }

  checkboxSelectChange(entry: any){
    this.itemSelectChange.emit(entry)
  }

  removeActionHandler(entry: any){
    this.removeItemHandler.emit(entry);
  }

  moveUpActionHandler(index: number){
    this.moveUpItemHandler.emit(index);
  }

  moveDownActionHandler(index: number){
    this.moveDownItemHandler.emit(index);
  }

  defaultActionHandler(entry: any){
    this.defaultItemHandler.emit(entry);
  }

  actionHandler($event, entry) {
    const data = {
      event: $event,
      entry
    };
    let action = this.actions.find((a) => a.name == $event.target.value);
    if(action) {
      action.doAction.emit(data);
    }
  }

  sortHandler($event) {
    if(this.column === $event) {
      this.orderDir = this.orderDir === SORTING_DESC ? SORTING_ASC : SORTING_DESC;
    }  else {
      this.orderDir = SORTING_ASC;
    }
    this.column = $event;
    this.sort.emit($event);
  }

  getSortingClass(header) {
    if (!header.sortable) return '';
    return this.column == header.name ? this.orderDir : 'sorting';
  }

  handleCellValueChanges() {
    this.value = this.records;
  }

  isChanged(value): boolean {
    return true;
  }
  /*
   * multiple suggestion
   */
  onQuerySuggestion (entry: any, data: any) {
    this.querySuggestion.emit({entry, data});
  }
  onRemoveSuggestionItem(entry: any, data: any) {
    this.removeSuggestion.emit({entry, data});
  }
  onAddSuggestionItem(entry: any, data: any) {
    this.addSuggestion.emit({entry, data});
  }

  onQuerySingleSuggestion(entry: any, data: any) {
    this.querySingleSuggestion.emit({entry, data});
  }

  onSingleSuggestionChanged (entry: any, data: any) {
    this.singleSuggestionChanged.emit({entry, data});
  }

  onSingleSugesstionClosed (entry: any, data: any) {
    this.singleSugesstionClosed.emit({entry, data});
  }

  onSelectboxChange(event: Event, data){
    this.selectboxChange.emit({event, data});
  }
}
