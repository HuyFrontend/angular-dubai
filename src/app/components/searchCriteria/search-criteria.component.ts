import {
  Component, OnChanges, EventEmitter, Output,
  ViewChild, OnInit, ViewEncapsulation, Input
} from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import { Observable } from 'rxjs/Observable';
import { MBCAutoSuggestion } from 'components/mbcAutoSuggestion';
import { MonthSuggestionComponent } from 'components/form/controls/monthSuggestion';
import { DEBOUNCE_TIME } from 'configs';
import { SearchCriteria} from 'models';
import { DATE_SEARCH_RANGES } from 'constant';
import { FormControl } from '@angular/forms';
import { getDateFormat } from 'utils/date-helpers';
@Component({
  selector: 'search-criteria',
  templateUrl: 'search-criteria.html',
  styleUrls: ['search-criteria.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchCriteriaComponent {
  private DATE_FILTER_FORMAT = 'DD/MM/YYYY';
  @ViewChild('autoSuggestion') public autoSuggestion: MBCAutoSuggestion;
  @ViewChild('monthSuggestion') public monthSuggestion: MonthSuggestionComponent;

  @Input() filterFields: Array<any> = [];
  @Input() filterOptions: Array<any> = [];
  @Input() bulkActions: Array<any> = [];
  @Input() defaultOrderBy: string = 'publishedDate';

  @Input() isRemoteSuggestion: boolean;

  @Output() onSearch = new EventEmitter<any>();
  @Output() onChangeFilterField = new EventEmitter<any>();
  @Output() onBulkAction = new EventEmitter<any>();
  @Output() remoteSuggest = new EventEmitter<any>();

  public isMonthSelect: boolean = false;
  public search: SearchCriteria = new SearchCriteria();
  public dateRange:string = '';
  public fromDate: FormControl = new FormControl();
  public toDate: FormControl = new FormControl();
  public listDateRanges = DATE_SEARCH_RANGES;
  public isMinimizeFilterDateRange: boolean = false;

  ngOnInit() {
    this.search.orderBy = this.defaultOrderBy;
    this.newSearch();
  }

  doSearchTime($event){
    this.search.fromDate = '';
    this.search.toDate = '';
    switch(this.dateRange) {
      case 'last7Days':
        this.search.fromDate = this.getDateInPast(6);
        this.search.toDate = this.getDateInPast(0);
        break;

      case 'lastWeek':
        let dateLastWeekFrom = new Date();
        dateLastWeekFrom.setDate(dateLastWeekFrom.getDate() -(dateLastWeekFrom.getDay()+ 7));
        this.search.fromDate = getDateFormat(dateLastWeekFrom, this.DATE_FILTER_FORMAT);

        let dateLastWeekTo = new Date();
        dateLastWeekTo.setDate(dateLastWeekTo.getDate() -(dateLastWeekTo.getDay()+1));
        this.search.toDate = getDateFormat(dateLastWeekTo, this.DATE_FILTER_FORMAT);
        break;

      case 'last30Days':
        this.search.fromDate = this.getDateInPast(29);
        this.search.toDate = this.getDateInPast(0);
        break;

      case 'lastMonth':
        const dateLastMonthFrom = new Date();
        dateLastMonthFrom.setMonth(dateLastMonthFrom.getMonth()-1);
        dateLastMonthFrom.setDate(1);
        this.search.fromDate = getDateFormat(dateLastMonthFrom, this.DATE_FILTER_FORMAT);

        const dateLastMonthTo = new Date();
        dateLastMonthTo.setDate(dateLastMonthTo.getDate() - dateLastMonthTo.getDate() - 1);
        this.search.toDate = getDateFormat(dateLastMonthTo, this.DATE_FILTER_FORMAT);
        break;

      case 'customDate':
        break;
    }
    this.newSearch();
  }

  getDateInPast(numberDateInPast: number){
    const date = new Date();
    date.setDate(date.getDate() - numberDateInPast);
    return getDateFormat(date, this.DATE_FILTER_FORMAT);
  }

  changeFilterField($event) {
    const selectValue: string = $event.target.value;
    if (selectValue === 'startDate' || selectValue === 'endDate') {
      this.isMonthSelect = true;
      if(this.monthSuggestion){
        this.monthSuggestion.resetSuggestionList();
      }
    } else {
      this.isMonthSelect = false;
    }
    this.autoSuggestion.clear();
    this.onChangeFilterField.emit($event)
  }

  doRemoteSuggest($event){
    this.remoteSuggest.emit($event);
  }

  newSearch() {
    this.search.page = 0;
    this.search.quickSearchValue = this.search.quickSearchValue.trim();
    this.onSearch.emit(this.search);
  }

  resetSearch() {
    this.search = new SearchCriteria();
    this.autoSuggestion.clear();
    this.dateRange = '';
    this.newSearch();
  }

  onListSelectedUpdate(listItem) {
    this.search.keywords = listItem.map(item => item.id === 'updated' ? 'modified' : item.id);
    this.newSearch();
  }

  filterDateRange() {
    this.search.fromDate = '';
    this.search.toDate = '';
    if (this.fromDate.value) {
      this.search.fromDate = getDateFormat(this.fromDate.value, this.DATE_FILTER_FORMAT);
    }
    if (this.toDate.value) {
      this.search.toDate = getDateFormat(this.toDate.value, this.DATE_FILTER_FORMAT);
    }
    this.newSearch();
    this.isMinimizeFilterDateRange = true;
  }

  showFilterDateRange() {
    this.isMinimizeFilterDateRange = false;
  }

}
