import { Component, OnInit, Input, Output, OnChanges, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PageModel, InfoPageGroup, InfoComponent, PageGroup } from 'models';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { NOTIFICATION_MESSAGE } from 'constant';
import { PageGroupService, PageService } from 'services';
@Component({
  selector: 'info-page-groups',
  styleUrls: ['info-page-groups.scss'],
  templateUrl: 'info-page-groups.html'
})

export class InfoPageGroupsComponent implements OnInit, OnChanges {

  @Input() mainPageEntityId: string;
  @Input() pageGroup: PageGroup;
  @Input() dataInput: InfoPageGroup;
  @Input() isFormSubmitted: boolean;

  @Output() infoComponentChange = new EventEmitter<any>();

  public infoPageGroupComponent: InfoPageGroup;

  constructor(
    private pageGroupService: PageGroupService,
    private pageService: PageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    if (this.dataInput) {  //InfoPageGroup existed
      this.infoPageGroupComponent = Object.assign({}, this.dataInput);
      this.infoPageGroupComponent.linkedData = this.infoPageGroupComponent.linkedData.map( (item) => {
        item.metadata = item.metadata || [];
        item.formatList = item.metadata.map(code => ({id: code, value: this.pageService.getMetadataText(code) }));
        return item;
      });

      this.pageGroupService.getListPagesFromPageGroup(this.pageGroup.pageGroupId)
        .subscribe((pages: Array<any>) => {
          this.infoPageGroupComponent.linkedData.forEach(linkedPage => {
            const pageData = pages.find(pageData => pageData.page.entityId == linkedPage.page.entityId)
            linkedPage.pageInfo = {
              type: pageData.page.data.info.type,
              subType: pageData.page.data.meta.pageSubType
            };
          });
        });

    } else {  //newly create
      this.infoPageGroupComponent = new InfoPageGroup();
      this.infoPageGroupComponent.pageGroup.entityId = this.pageGroup.pageGroupId;
      this.infoPageGroupComponent.pageGroup.displayName = this.pageGroup.pageGroupName;
      this.initLinkedData(this.pageGroup.pageGroupId);
      // this.getPageGroupDetail(this.pageGroup.pageGroupId);
    }
  }

  ngOnChanges() { }

  ngAfterViewInit() { }

  /**
   * get pages bellong to this page group
   * load in case add new page group component
   * @param {pageGroupID} :string
   */
  private initLinkedData(pageGroupID: string) {
    this.pageGroupService.getListPagesFromPageGroup(pageGroupID)
      .subscribe((pages: any) => {

        this.infoPageGroupComponent.linkedData = pages
          .filter(item => item.page.entityId !== this.mainPageEntityId)
          .map( (item) => {
            const data = item.page.data;
            return {
              page: {
                entityId: item.page.entityId,
                displayName: data.info.title
              },
              metadata: [],
              isShow: false,
              pageInfo: {
                type: data.info.type,
                subType: data.meta.pageSubType
              }
            };
          });
    }, (error: any) => {
      throw new Error (error);
    }, () => {
      this.onInfoComponentChange();
      this.changeDetectorRef.markForCheck();
    });
  }

  private converStringToObjectMetadata (list: string[], pageId?: string) {
    const listSuggest =[{id: 'meta-1', value: 'Moec'}, {id: 'meta-2', value: "Meta Page"} ];
    const objList = listSuggest.filter( (itemParent) => {
      return list.filter( (itemChild)=> {
        return itemChild == itemParent.id;
      }).length > 0
    });
    return objList;
  };
  /**
   * multi suggestion metadata
   */
  public onQuerySuggestion({ entry: { val, updateEvent }, data }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    const pageInfo = (data && data.pageInfo) ? data.pageInfo : {};

    this.pageService.suggestPageMetadata(val, pageInfo.type, pageInfo.subType)
      .subscribe( (listPageMetadata) => {
      if (listPageMetadata) {
        listPageMetadata = listPageMetadata.map((item) => {
          return { id: item.code, value: item.text };
        });
        _updateEvent.next(listPageMetadata);
      } else {
        _updateEvent.next([]);
      }
    }, (error) => {
      _updateEvent.next([]);
    });
  }
  /**
   * add item to metadata list
   */
  public onAddSuggestion(event) {
    const pageId = event.data.page.entityId;
    const metaDataItem = event.entry.id;
    this.infoPageGroupComponent.linkedData.filter( (item) => {
      if (item['page']['entityId'] === pageId) {
        item.metadata.push(metaDataItem);
      }
    });
    this.onInfoComponentChange();
  }
  /**
   * remove an item on metadata list
   */
  public onRemoveSuggestion(event) {
    const pageId = event.data.page.entityId;
    const metaDataItem = event.entry.id;

    this.infoPageGroupComponent.linkedData.forEach(element => {
        if(element.page.entityId == pageId ){
          element.metadata = element.metadata.filter(m=>m != metaDataItem)
        }
    });
    this.onInfoComponentChange();
  }
  // end multi suggestion metadata

  /**
   * detech form change value and emit pagegroup data to parent
   * @param event change form model
   */
  public onInfoComponentChange(event?: any) {
    const linkedDataPost = this.infoPageGroupComponent.linkedData.map( (item) => {
      return {
        isShow: item.isShow,
        metadata: item.metadata,
        page: item.page
      }
    });

    const { pageGroup, label, showDataOnStream }  = this.infoPageGroupComponent;
    const data = {
      pageGroup,
      label,
      showDataOnStream,
      linkedData: linkedDataPost
    };
    this.infoComponentChange.emit(data);
  };

  /**
   * Move up/down rows in table
   */
  public movePageHandler(index: any, seek: number){
    if( (index <= 0 && seek == -1) || (index >= this.infoPageGroupComponent.linkedData.length-1 && seek == 1)) {
      return;
    }
    const temp = this.infoPageGroupComponent.linkedData[index];
    this.infoPageGroupComponent.linkedData[index] = this.infoPageGroupComponent.linkedData[index + seek];
    this.infoPageGroupComponent.linkedData[index + seek] = temp;
    this.onInfoComponentChange();
  };

  public isValid(){
    //TODO check page group validation here
    return true;
  }
}
