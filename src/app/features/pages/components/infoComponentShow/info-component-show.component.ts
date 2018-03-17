import { PAGE_STATUS } from 'constant';
import { LinkedData } from 'models';
import { SimpleChanges } from '@angular/core';
import { InfoComponent } from 'models';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewEncapsulation,
  ViewChild,

} from '@angular/core';
import { PageService  } from 'services';
import { LocalStorageService } from 'ngx-webstorage';
import { storageConfigs } from 'configs';
import { PageSuggestionRequest, PageInfo } from 'models';
import { PageSubTypeService } from 'features/pages/page-subType.service';
import { InfoComponentShowData, ShowLinkedData, Page, LinkedItem } from './info-component-show.model';
import { MBCConfirmationComponent } from "components/mbcConfirmation";
import { INFO_COMPONENT_FIELD } from 'constant';


@Component({
  selector: "info-component-show",
  styleUrls: ["info-component-show.scss"],
  templateUrl: "info-component-show.html",
  providers: [PageSubTypeService]
})
export class InfoComponentShowComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() mainPageEntityId: string;
  @Input() pageInfo: PageInfo;
  @Input() dataInput: InfoComponentShowData;
  @Input() isFormSubmitted: boolean;
  @Output() infoComponentChange = new EventEmitter<InfoComponentShowData>();

  @ViewChild('subtypeChangeConfirmPopup') public subtypeChangeConfirmPopup: MBCConfirmationComponent;

  public subTypes: Array<Object>;
  // public linkTypes1: Array<{value:string, text:string}>;
  public linkTypes2: Array<{value:string, text:string}>;

  public icData: InfoComponentShowData;

  private defaultLocale:string = 'en';
  private inputSubject:Subject<any> = new Subject();
  private currentPageSubType: string;

  constructor(
    private pageService: PageService,
    private pageSubTypeService: PageSubTypeService,
    private localStorageService: LocalStorageService
  ) {
    this.subTypes = [];

    this.linkTypes2 = [
      // { value: 'METADATA', text: INFO_COMPONENT_FIELD.LINKED_ITEM_2.METADATA },
      { value: 'CHARACTER', text: INFO_COMPONENT_FIELD.LINKED_ITEM_2.CHARACTER }
    ];
    this.icData = new InfoComponentShowData();

    this.inputSubject
      .debounceTime(500)
      .subscribe(val => {
        this.onInfoControlChanged();
      });

  }

  instantiateShowLinkedData() : ShowLinkedData {
    const mainPage = new Page(this.mainPageEntityId, this.pageInfo.internalUniquePageName);
    const linkedItem1 = new LinkedItem(mainPage, undefined, undefined, undefined);
    const linkedItem2 = this.instantiateShowLinkedItem2();
    const linkedData =  new ShowLinkedData(undefined, linkedItem1, linkedItem2);
    linkedData._props = {};
    return linkedData;
  }

  instantiateShowLinkedItem2(){
    return  new LinkedItem(undefined, null, null, undefined);
  }

  ngOnInit() {
    if(this.icData.linkDataBOList.length == 0){
      this.icData.linkDataBOList.push(this.instantiateShowLinkedData());
    }
    const cachePageConfigs = this.localStorageService.retrieve(storageConfigs.page);
    this.pageSubTypeService.getDataFromCache('showSubTypes', cachePageConfigs)
      .subscribe(data => {
      this.subTypes = data.map(e => {
        let result:any = {code: e.code};
        result.name = e.names.find(obj => obj.locale === this.defaultLocale).text;
        return result;
      });
    });

    this.onInfoControlChanged();
  }

  ngAfterViewInit() {}

  ngOnChanges(changes: SimpleChanges) {
    //Only accept dataInput at first time.
    if(changes.dataInput && changes.dataInput.firstChange && changes.dataInput.currentValue){
      this.icData = this.fixICData(changes.dataInput.currentValue);
      this.currentPageSubType = this.icData.pageSubType;
    }

    if(changes.pageInfo){
      this.icData.pageType = changes.pageInfo.currentValue.type;
    }
  }

  fixICData(data: InfoComponentShowData){
    data.linkDataBOList = data.linkDataBOList.map( linkedData => {
      //In case Server auto generate IC,
      //They may generate linkedItem1 only (without linkedItem2)
      //Save ourself from null pointer here
      const linkedItem2 = linkedData.linkedItem2 || this.instantiateShowLinkedItem2();
      const linkedDataInstance = new ShowLinkedData(linkedData.entityId, linkedData.linkedItem1, linkedItem2);
      linkedDataInstance._props = {
        currentSubType: linkedData.linkedItem1.linkType
      };
      return linkedDataInstance;
    });
    return data;
  }

  onTitleChange(){
    this.inputSubject.next();
  }

  onQueryItem1Page2({val, updateEvent}, subType) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;

    const excludeIds = [ this.mainPageEntityId ];

    const excludedStatus = [ PAGE_STATUS.DRAFT, PAGE_STATUS.INACTIVE ];

    this.pageService
        .suggest(new PageSuggestionRequest("linkedPageForIcProfile", val, 'show', subType, excludeIds, excludedStatus))
        .subscribe(pages => {
            pages = pages.map(page => ({ entityId: page.entityId, displayName: page.internalUniquePageName } ));
            _updateEvent.next(pages);
        });
  }

  onItem1Page2Change(entry, rowData: ShowLinkedData){
    if(entry){
      rowData.linkedItem1.page2 = new Page(entry.entityId, entry.displayName);
    } else {
      rowData.linkedItem1.page2 = null;
    }
    rowData.linkedItem2.page1 = rowData.linkedItem1.page2;
    this.onInfoControlChanged();
  }

  onItem2Page2PChange(entry, rowData: ShowLinkedData){
    rowData.linkedItem2.page2 = entry ? new Page(entry.entityId, entry.displayName): null;
    this.onInfoControlChanged();
  }

  /**
   * add item to metadata list
   */
  onAddItem2Page2(entry, rowData: ShowLinkedData) {
    rowData.linkedItem2.page2 = entry;
    this.onInfoControlChanged();
  }
  /**
   * remove an item on metadata list
   */
  onRemoveItem2Page2(entry, rowData: ShowLinkedData) {
    rowData.linkedItem2.page2 = null;
    this.onInfoControlChanged();
  }

  /**
   * multi suggestion metadata
   */
  onQueryItem2({val, updateEvent}, rowData: ShowLinkedData){
    const _updateEvent: BehaviorSubject<any> = updateEvent;

    if(rowData.linkedItem2.linkType !== 'METADATA'){
      this.pageService
        .suggest(new PageSuggestionRequest("character", val, undefined, undefined))
        .subscribe(pages => {
          pages = pages.map(page => ({entityId: page.entityId, displayName: page.internalUniquePageName}));
          _updateEvent.next(pages);
        });
    } else {
      this.pageService
          .suggestPageMetadata(val, 'show', rowData.linkedItem1.linkType)
          .subscribe(listPageMetadata => {
              _updateEvent.next(listPageMetadata);
          });
    }
  }
  /**
   * add item to metadata list
   */
  onAddItem2Metadata(entry, rowData: ShowLinkedData) {
    rowData.linkedItem2.linkProperties.metadata.push(entry);
    this.onInfoControlChanged();
  }
  /**
   * remove an item on metadata list
   */
  onRemoveItem2MetaData(entry, rowData: ShowLinkedData) {
    rowData.linkedItem2.linkProperties.metadata = rowData.linkedItem2.linkProperties.metadata.filter(val => val != entry);
    this.onInfoControlChanged();
  }

  onRelationSelectboxChange( value, rowData: ShowLinkedData){
    //Change relation type => old Linked Values is not relavant anymore => clear it.
    const linkedItem2: LinkedItem = rowData.linkedItem2;
    if(value === 'METADATA'){
      linkedItem2.page2 = null;
    } else {
      linkedItem2.linkProperties.metadata = [];
    }
  }

  onPageSubTypeChanged(linkedData: ShowLinkedData){
    if(linkedData._props.currentSubType){
      this.subtypeChangeConfirmPopup.show(linkedData);
    } else{
      linkedData._props.currentSubType = linkedData.linkedItem1.linkType;
    }
  }

  commitChangingPageSubType(linkedData: ShowLinkedData){
    //Reset linkedData
    linkedData.linkedItem1 = new LinkedItem(linkedData.linkedItem1.page1, undefined, linkedData.linkedItem1.linkType, undefined);
    linkedData.linkedItem2 = this.instantiateShowLinkedItem2();
    linkedData._props = {
      currentSubType: linkedData.linkedItem1.linkType
    };

    this.onInfoControlChanged();
  }

  addNewLinkedData(){
    this.icData.linkDataBOList.push(this.instantiateShowLinkedData());
  }

  revertChangingPageSubType(linkedData: ShowLinkedData){
    linkedData.linkedItem1.linkType = linkedData._props.currentSubType;
  }

  onInfoControlChanged(){
    const emitData = Object.assign({}, this.icData);
    emitData.linkDataBOList = emitData.linkDataBOList.filter(linkedData => {
      return linkedData.linkedItem1.page2
         && (!linkedData.linkedItem2.linkType || linkedData.linkedItem2.linkType === 'METADATA' || linkedData.linkedItem2.page2);
    })
    .map(linkedData => linkedData.getValue());

    this.infoComponentChange.emit(emitData);
  }

  onRemoveRow(index: number){
    this.icData.linkDataBOList.splice(index, 1);
    this.onInfoControlChanged();
  }

  movePageHandler(index:number, seek:number){
    const temp = this.icData.linkDataBOList[index];
    this.icData.linkDataBOList[index] = this.icData.linkDataBOList[index + seek];
    this.icData.linkDataBOList[index + seek] = temp;
    this.onInfoControlChanged();
  }

  isAbleToAddLinkedData(){
    const unCompletedRow = this.icData.linkDataBOList.find(linkedData => {
      return !linkedData.linkedItem1.page2
         || (linkedData.linkedItem2.linkType && linkedData.linkedItem2.linkType !== 'METADATA' && !linkedData.linkedItem2.page2);
    });
    return !unCompletedRow;
  }

  isValid(){
    return this.icData.linkDataBOList.length > 0 && this.isLinkedDataValid();
  }

  isLinkedDataValid(){
    const linkDataBOList = this.icData.linkDataBOList;
    if(linkDataBOList && linkDataBOList.length > 0){
      const invalidRow = linkDataBOList.find(linkedData => {
        const isHaveItem1Page2 = linkedData.linkedItem1.linkType && linkedData.linkedItem1.page2;
        let isItem2Valid = true;
        if(linkedData.linkedItem2.linkType){
          if(linkedData.linkedItem2.linkType === 'CHARACTER' && !linkedData.linkedItem2.page2){
            isItem2Valid = false;
          }
        }
        return !isHaveItem1Page2 || !isItem2Valid;
      });

      return !invalidRow;
    }
    return false;
  }
}
