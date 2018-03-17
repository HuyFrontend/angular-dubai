import { Http } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { trigger,state,style,transition,animate,keyframes } from '@angular/animations';

import { DEBOUNCE_TIME } from 'configs';
import { CloudinaryService, PageService, AppConfigService } from 'services';
import { CloudinarySearchCriteria, ImageInfo, PageSuggestionRequest } from 'models';
import { getInterestSuggestions } from "utils";
import { MBCConfirmationComponent } from "components/mbcConfirmation";

@Component({
  selector: 'search-widget',
  templateUrl: 'search-widget.html',
  styleUrls: ['search-widget.scss'],
  animations: [
    trigger('popupAnimation', [
      state('hide', style({
        display: 'none',
        opacity: 0,
        top: '12%'
      })),
      state('show', style({
        display: 'block',
        top: '5%'
      })),
      transition('hide => show', animate('250ms 500ms ease-out', style({
        opacity: 1,
        top: '5%'
      }))),
      transition('show => hide', animate('400ms ease-out', style({
        opacity: 0,
        top: '10%'
      }))),
    ]),
    trigger('overlayAnimation', [
      state('hide', style({
        display: 'none',
        opacity: 0,
        transform: 'scale(0, 0)'
      })),
      state('show', style({
        display: 'block',
        opacity: 1,
        transform: 'scale(1, 1)'
      })),
      transition('hide => show', animate('350ms ease-out', style({
        opacity: 1,
        transform: 'scale(1, 1)'
      }))),
      transition('show => hide', animate('150ms 350ms ease-out', style({
        opacity: 0
      }))),
    ])
  ]
})
export class SearchWidgetComponent implements OnInit {

  @Input() isTypeSelectMultiple: boolean; // single || multiple

  @ViewChild('confirmPopup') public confirmPopup: MBCConfirmationComponent;

  @Output() onAdded: EventEmitter<ImageInfo> = new EventEmitter<ImageInfo>();
  @Output() onSelectedListImageInfo: EventEmitter<ImageInfo[]> = new EventEmitter<ImageInfo[]>();

  public popupState: string = 'hide';
  public overlayState: string = 'hide';
  public listFoundImages: any[];
  public title: string;
  public description: string;
  public listAuthoPageSelected : any[];
  public listTagPageSelected : any[];
  public listInterestsSelected : any[];
  public startDate: any;
  public endDate: any;
  public currentSearchQuery: string;
  public nextCursor: string;
  public selectedListImageInfo: ImageInfo[];
  public isShowLoading: boolean;
  public totalCount: number;
  public isSearchSubmitted: boolean;
  private isNoSearchMore: boolean;

  constructor(
    private http: Http,
    private changeDetectorRef: ChangeDetectorRef,
    private cloudinaryService: CloudinaryService,
    private pageService: PageService,
    private configServive: AppConfigService
  ){
    this.currentSearchQuery = '';
    this.nextCursor = '';
    this.selectedListImageInfo = [];
    this.isShowLoading = false;
    this.totalCount = 0;
    this.isNoSearchMore = false;
    this.isSearchSubmitted = false;
  }

  ngOnInit() {
    this.cleanUpOldData();
  }

  cleanUpOldData () {
    this.listFoundImages = [];
    this.listAuthoPageSelected = [];
    this.listTagPageSelected = [];
    this.listInterestsSelected = [];
    this.title = '';
    this.description = '';
    this.selectedListImageInfo = [];
    this.startDate = '';
    this.endDate='';
    this.isSearchSubmitted = false;
  }

  hidePopup() {
    this.popupState = 'hide';
    this.overlayState = 'hide';
    document.body.style.overflowY = 'scroll';
    document.documentElement.style.overflowY = 'scroll';
    this.cleanUpOldData();
  }

  showPopup() {
    this.popupState = 'show';
    this.overlayState = 'show';
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
    this.cleanUpOldData();
  }

  searchImage(eventType?: { scroll?: boolean }) {
    if (this.isNoSearchMore && eventType && eventType.scroll) {
      return;
    }

    let searchCriteria = new CloudinarySearchCriteria();
    if (eventType && eventType.scroll) {
      searchCriteria.expression = this.currentSearchQuery;
      searchCriteria.next_cursor = this.nextCursor;
      this.isShowLoading = true;
      if (this.totalCount <= this.listFoundImages.length) {
        this.isShowLoading = false;
        this.isNoSearchMore = true;
        return;
      }
    } else {
      this.selectedListImageInfo = [];
      searchCriteria.expression = this.buildExpressionString();
    }
    if (searchCriteria.expression) {
      this.cloudinaryService.searchImageFromDam(searchCriteria).subscribe( (value: any) => {
        var {total_count:totalCount, time, next_cursor:nextCursor, resources} = value;

        if (!eventType || !eventType.scroll) {
          this.listFoundImages = [];
          this.isSearchSubmitted = true;
        }

        this.totalCount = totalCount ? totalCount : 0;
        this.nextCursor = nextCursor;

        if (resources) {
          resources.forEach(element => {
            this.listFoundImages.push(element);
          });
        }
        this.isShowLoading = false;
        this.isNoSearchMore = false;
        this.changeDetectorRef.detectChanges();
      }, (error: any) => {
        this.isShowLoading = false;
        this.isNoSearchMore = false;
        if (!eventType || !eventType.scroll) {
          this.listFoundImages = [];
          this.isSearchSubmitted = true;
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  buildExpressionString() {
    let result = '';
    let alreadyContainSomeConditions = false;
    //Title
    if (!this.isStringEmpty(this.title)) {
      if (alreadyContainSomeConditions)
        result = result + " AND ";

      result = result + 'context.entityDataTitle:' + "+" + this.title.trim();
      alreadyContainSomeConditions = true;
    }
    //Description
    if (!this.isStringEmpty(this.description)) {
      if (alreadyContainSomeConditions)
        result = result + " AND ";

      result = result + 'context.description:' + "+" + this.description.trim();
      alreadyContainSomeConditions = true;
    }
    //Author Page
    if (this.listAuthoPageSelected && this.listAuthoPageSelected.length > 0) {
      if (alreadyContainSomeConditions)
        result = result + " AND ";
      let i = 0;
      this.listAuthoPageSelected.forEach(item => {
        result = result + 'context.authoringPageTitle:' + "+" + item.internalUniquePageName;

        if (i < this.listAuthoPageSelected.length - 1)
          result = result + " OR ";
        i+= 1;
      });
      alreadyContainSomeConditions = true;
    }
    // Tag Page
    if (this.listTagPageSelected && this.listTagPageSelected.length > 0) {
      if (alreadyContainSomeConditions)
        result = result + " AND ";

      let i = 0;
      this.listTagPageSelected.forEach(item => {
        result = result + 'context.taggedPageTitles:' + "+" + item.internalUniquePageName;

        if (i < this.listTagPageSelected.length - 1)
          result = result + " OR ";
        i+= 1;
      });
      alreadyContainSomeConditions = true;
    }
    // Interest
    if (this.listInterestsSelected && this.listInterestsSelected.length > 0) {
      if (alreadyContainSomeConditions)
        result = result + " AND ";

      let i = 0;
      this.listInterestsSelected.forEach(item => {
        result = result + 'context.interests:' + "+" + item.value;

        if (i < this.listInterestsSelected.length - 1)
          result = result + " OR ";
        i+= 1;
      });
      alreadyContainSomeConditions = true;
    }
    // uploaded from
    if (this.startDate) {
      if (alreadyContainSomeConditions)
        result = result + " AND ";
      result = result + 'uploaded_at>=' + this.toUTC(this.startDate, false);

      alreadyContainSomeConditions = true;
    }

    // uploaded to
    if (this.endDate) {
      if (alreadyContainSomeConditions)
        result = result + " AND ";
      result = result + 'uploaded_at<=' + this.toUTC(this.endDate, true);

      alreadyContainSomeConditions = true;
    }
    this.currentSearchQuery = result;
    return result;
  }

  toUTC(date, isUntilDate) {
    if (!date)
      return null;
    let dateUTC;
    if (isUntilDate) {
      let end = new Date(date);
      end.setHours(23,59,59,999);
      dateUTC = end.toISOString();
    } else {
      let start = new Date(date);
      start.setHours(0,0,0,0);
      dateUTC = start.toISOString();
    }
    return Math.floor(new Date(dateUTC).getTime()/1000);
  }

  isStringEmpty (string: string ) {
    return !string || 0 === string.length || !string.trim();
  }

  onQueryTagPage({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;

    //TODO: Prevent duplicate page with publishOnBeHalf
    this.pageService
      .suggest(new PageSuggestionRequest('tag', val, '', ''))
      .subscribe(listPage => {
        _updateEvent.next(this.convertToContentRelationship(listPage, 'internalUniquePageName'));
      });
  }

  convertToContentRelationship(listItem: any[], key) {
    const display = 'displayName';
    listItem.map((item, idx, ar) => {
      item[display] = item[key];
      return item;
    });
    return listItem;
  }

  onPageChanged(data: any) {
    data = this.listTagPageSelected;
  }

  onAddedPage(obj: any) {
    if (obj) {
      this.listTagPageSelected.push(obj);
    }
  }

  onRemovePage(page: any) {
    if (page) {
      this.listTagPageSelected = this.listTagPageSelected.filter(x => x.internalUniquePageName !== page.internalUniquePageName);
    }
  }

  onQueryInterest({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    this.configServive.fetchInterestConfigs().subscribe(x => {
      //TODO: excluded Ids
      const results = getInterestSuggestions(val, x, null);
      _updateEvent.next(this.convertToContentRelationship(results, 'id'));
    });
  }

  onInterestSelectedChanged(listSelected: any) {
    listSelected = this.listInterestsSelected;
  }

  onAddedInterest(interest: any) {
    if (interest) {
      this.listInterestsSelected.push(interest);
    }
  }

  onRemoveInterest(interest: any) {
    if (interest) {
      this.listInterestsSelected = this.listInterestsSelected.filter(x => x.value != interest.value);
    }
  }

  onQueryAuthoPage({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    this.pageService
      .suggest(new PageSuggestionRequest('publishOnBehalf', val, '', ''))
      .subscribe(listPage => {
        _updateEvent.next(this.convertToContentRelationship(listPage, 'internalUniquePageName'));
      });
  }

  onAthoPageChanged(data: any) {
    data = this.listAuthoPageSelected;
  }

  onAddedAuthoPage(obj: any) {
    if (obj) {
      this.listAuthoPageSelected.push(obj);
    }
  }

  onRemoveAuthoPage(page: any) {
    if (page) {
      this.listAuthoPageSelected = this.listAuthoPageSelected.filter(x => x.internalUniquePageName !== page.internalUniquePageName);
    }
  }

  onItemAdded(e: any) {
    this.confirmPopup.show(e);
  }

  onConfirmChoosingImage(e : any) {
    this.onAdded.emit(e);
    this.hidePopup();
  }
  /**
   * add/remove item from selected list
   * toogle event
   */
  onSelectOrRemoveItem({ type, data }) {
    if (type === 'add') {
      this.selectedListImageInfo.push(data);
    } else if (type === 'addSelected') {
      this.selectedListImageInfo = [];
      this.selectedListImageInfo.push(data);
      this.addList();
    } else {
      this.selectedListImageInfo = this.selectedListImageInfo.filter( (item)=> item['damId']!== data['damId']);
    }
  }
  /**
   * confirm add choosed list
   * click event
   */
  addList() {
    if (this.selectedListImageInfo.length) {
      this.onSelectedListImageInfo.emit(this.selectedListImageInfo);
    }
  }
  /**
   * load more images
   * scroll event
   */
  @HostListener('scroll', ['$event']) public onScroll(event: Event) {
    const resultElement = event.srcElement;
    const elementHeight = resultElement.clientHeight;
    const resultScrollTop = resultElement.scrollTop;
    const resultScrollHeight = resultElement.scrollHeight;
    if (elementHeight + resultScrollTop === resultScrollHeight) {
      // recall api to search next
      this.searchImage({ scroll: true });
    }
  }
}
