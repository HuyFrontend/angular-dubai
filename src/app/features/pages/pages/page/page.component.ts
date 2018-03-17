import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import cloneDeep from 'lodash/cloneDeep';
import * as format from 'string-format';
import { LocalStorageService } from 'ngx-webstorage';

import { PageService, WorkflowService } from 'services';
import { PageModel, PageInfo, PageSetting, PageMeta, SearchCriteria } from 'models';
import { storageConfigs } from 'configs';
import { AlertsActions } from 'state';
import { CONTENT_TYPE, NOTIFICATION_MESSAGE, NOTIFICATION_TYPE ,PAGE_STATUS } from 'constant';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { MBCAutoSuggestion } from 'components/mbcAutoSuggestion';
import { dateFormatter} from 'utils/formatters';

@Component({
  selector: 'page',
  templateUrl: 'page.html'
})

export class PageComponent {
  @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishBulkPopup') public confirmUnpublishBulkPopup: MBCConfirmationComponent;
  @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
  @ViewChild('confirmDeleteBulkPopup') public confirmDeleteBulkPopup: MBCConfirmationComponent;
  @ViewChild('autoSuggestion') public autoSuggestion: MBCAutoSuggestion;
  private defaultSearch = {
    field: '',
    keywords: [],
    orderBy: 'publishedDate',
    orderDir: 'sorting_desc',
    page: 0,
    pageSize: 20
  };

  public search: SearchCriteria = cloneDeep(this.defaultSearch);
  public pages: Array<PageModel> = [];
  public totalPages: number;

  public filterOptions = [];
  public loading: boolean = true;
  public headers: Array<any> = [];
  public orderFieldDefault: string = 'status';
  public dateFormatter = dateFormatter;
  public hasMore: boolean;
  public hasSelectedPages: boolean = false;
  public hasPublishPages: boolean = false;
  public hasUnpublishPages: boolean = false;
  public message = NOTIFICATION_MESSAGE;
  public isRemoteSuggestion:boolean = false;

  public bulkActions = [{
    value: 'publish',
    text: 'Publish',
    isValid: () => this.hasPublishPages
  },{
    value: 'unpublish',
    text: 'Un-publish',
    isValid: () => this.hasUnpublishPages
  },{
    value: 'delete',
    text: 'Delete',
    isValid: () => this.hasSelectedPages
  }];

  public filterFields =[
    {value: 'data.info.language', text: 'Language'},
    {value: 'status',text: 'Status'},
    {value: 'data.info.type',text: 'Type'},
    {value: 'profileSubTypes',text: 'Profile Sub-type'},
    {value: 'showSubTypes',text: 'Show Sub-type'},
    {value: 'creator',text: 'Creator'}
  ]

  private pageSubTypes = [
    "channelSubTypes",
    "companyBusinessSubTypes",
    "eventsSubTypes",
    "profileSubTypes",
    "sectionSubTypes",
    "showSubTypes"
  ]

  private pageConfigs : any;
  constructor(
    private alertsActions: AlertsActions,
    private pageServices: PageService,
    private storage: LocalStorageService,
    private workflowService: WorkflowService,
    private router: Router) {
    this.pageConfigs = this.storage.retrieve(storageConfigs.page);
  }

  ngOnInit() {
  }

  changeFilterField($event) {
    const searchValue: string = $event.target.value;

    this.filterOptions = [];
    this.isRemoteSuggestion = false;

    switch(searchValue){
      case 'data.info.language':
        this.filterOptions = [
          { id: 'en', value: 'English' },
          { id: 'ar', value: 'Arabic' }
        ];
        break;
      case 'status':
        this.filterOptions = [
          { id: PAGE_STATUS.LIVE, value: 'Live' },
          { id: PAGE_STATUS.UPDATED, value: 'Updated' },
          { id: PAGE_STATUS.DRAFT, value: 'Draft' },
          { id: PAGE_STATUS.INACTIVE, value: 'Unpublished' }
        ];
        break;
      case 'data.info.type':
        this.filterOptions = this.pageConfigs['pageTypes'].map((t) => {
          return { id: t.code, value: t.names[0].text }
        });
        break;
      case 'profileSubTypes':
        this.filterOptions = this.pageConfigs['profileSubTypes'].map((t) => {
          return { id: t.code, value: t.names[0].text }
        });
        break
      case 'showSubTypes':
        this.filterOptions = this.pageConfigs['showSubTypes'].map((t) => {
          return { id: t.code, value: t.names[0].text }
        });
        break
    }
  }

  sort(field) {
    if (this.search.orderBy !== field) {
      this.search.orderDir = 'sorting_asc';
    } else {
      this.search.orderDir = this.search.orderDir === 'sorting_asc' ? 'sorting_desc' : 'sorting_asc';
    }
    this.search.orderBy = field;
    this.search.page = 0;
    this.pages = [];
    this.searchPages();
  }

  searchPages($event = { id: '', name: '' }) {
    this.loading = true;
    this.search.type = 'page';

    // TODO : temporary fix for MDP-9158, profile and show subtypes use same field : data.meta.pageSubType
    let currentSearch = cloneDeep(this.search);
    if(currentSearch.field === 'profileSubTypes' || currentSearch.field === 'showSubTypes') {
      currentSearch.field = 'data.meta.pageSubType';
    }
    this.pageServices.searchPages(currentSearch).subscribe(result =>
      { const pageConfigs = this.storage.retrieve(storageConfigs.page);
        this.assignResult(result, pageConfigs)
        this.loading = false;
      });
  }

  newSearch($event) {
    if($event){
      this.search = $event;
    }
    this.hasMore = true;
    this.search.page = 0;
    this.pages = [];
    this.searchPages();
  }

  loadMore($event) {
    if (this.hasMore && !this.loading) {
      this.loading = true;
      this.search.page += 1;
      this.searchPages();
    }
  }

  getDetailUrl(entry) {
    return `/pages/detail/${entry.entityId}`
  }

  publishAPage($event) {
    const pageId = $event.entry.entityId;
    this.confirmPublishPopup.show([pageId]);
    $event.event.target.value = '';
  }

  confirmUnpublishPage($event) {
    const $page = $event.entry;
    this.confirmUnpublishPopup.show($page);
    $event.event.target.value = '';
  }

  unpublishPage($page) {
    const pageId = $page.entityId;
    this.workflowService.unpublish(CONTENT_TYPE.PAGE, pageId)
      .subscribe(res => {
        $page.status = res.status;
        if (PAGE_STATUS.UNPUBLISH === $page.status) {

          let options = {
            currentStatus: PAGE_STATUS.UNPUBLISH,
            targetStatus: PAGE_STATUS.INACTIVE
          };

          this.workflowService.getStatusInterval((variables) => {
            $page.status = variables.status;
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                    format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                                    'Un-published'));
          }, CONTENT_TYPE.PAGE, pageId ,options);
        }
      });
  }

  unpublishPages($pages) {
    const unpublishBulkReq = $pages.map(page => ({
      entityId: page.entityId,
      entityType: page.type
    }));

    this.workflowService.unpublishBulk(unpublishBulkReq).subscribe(result => {
      $pages.forEach($page => {
        $page.checked = false;
        $page.status = result.filter(p => p.entityIdentifier.entityId === $page.entityId)
          .map(p => p.status)[0];
      });
    });

    let options = {
      currentStatus: PAGE_STATUS.UNPUBLISH,
      targetStatus: PAGE_STATUS.INACTIVE
    };
    this.workflowService.getBulkStatusInterval((result) => {
      $pages.forEach($page => {
        var status = result.filter(p => p.entityIdentifier.entityId === $page.entityId)
          .map(p => p.status)[0];
        if (status) {
          $page.status = status;
        }
      });

      this.pageSelectedChange($pages);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-published'));

    }, unpublishBulkReq, options);
  }


  confirmDelete($event) {
    const $page = $event.entry;
    this.confirmDeletePopup.show($page);
    $event.event.target.value = '';
  }

  onDelete($page) {
    const pageId = $page.entityId;

    this.pageServices.deleteRelatives( [ pageId ] ).subscribe( delRes => {
      this.workflowService.delete(CONTENT_TYPE.PAGE, pageId)
        .subscribe(res => {
          let index = this.pages.findIndex(item => item.entityId === pageId);
          this.pages.splice(index, 1);
          this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
        });
    })

  }

  onDeleteBulk($pages){
    const bulkReq = $pages.map(page => ({
      entityId: page.entityId,
      entityType: page.type
    }));
    const pageIds = $pages.map(page => page.entityId);

    this.pageServices.deleteRelatives( pageIds ).subscribe( delRes => {
      this.workflowService.deleteBulk(bulkReq).subscribe(result => {
        $pages.forEach(page => {
          let index = this.pages.findIndex(item => item.entityId === page.entityId);
          this.pages.splice(index, 1);
        });

        this.pageSelectedChange($pages);
        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
      });
    });
  }

  pageSelectedChange($event){
    this.hasSelectedPages = this.pages.filter(p => p.checked).length > 0;

    this.hasPublishPages = this.hasSelectedPages
      && this.pages.filter(p => p.checked
      && p.status !== PAGE_STATUS.LIVE
      && p.status !== PAGE_STATUS.READY).length > 0;

    this.hasUnpublishPages = this.hasSelectedPages
      && this.pages.filter(p => p.checked
      && (p.status === PAGE_STATUS.LIVE || p.status === PAGE_STATUS.UPDATED)).length > 0;
  }

  editPage($event) {
    const pageId = $event.entry.entityId;
    this.router.navigate(['pages', 'detail', `${pageId}`]);
  }

  copyPage($event) {
    const pageId = $event.entry.entityId;
    this.router.navigate(['pages', 'create'], { queryParams: { copyFromId: pageId } })
  }

  publishPages(pageIds: Array<string>) {
    const res = this.pageServices.publishPage(pageIds).subscribe(result => {
      for (let i = 0; i < result.length; i++) {
        const publishedPage = result[i];
        for (let j = 0; j < this.pages.length; j++) {
          const page = this.pages[j];
          if (page.entityId === publishedPage.entityId) {
            page.status = publishedPage.status;
            page.publishedDate = publishedPage.publishedDate;
          }
        }
      }
      this.clearChecked();

      const bulkReq = pageIds.map(id => ({
        entityId: id,
        entityType: CONTENT_TYPE.PAGE
      }));

      let options = {
        currentStatus: [PAGE_STATUS.INACTIVE, PAGE_STATUS.DRAFT],
        targetStatus: PAGE_STATUS.LIVE
      };
      this.workflowService.getBulkVariablesInterval((result) => {
        this.pages.forEach($page => {
          var variables = result.filter(p => p.entityIdentifier.entityId === $page.entityId)
            .map(p => p.variables)[0];
          if (variables) {
            $page.status = variables.status;
            $page.publishedDate = variables.publishDate;
          }
        });

        this.pageSelectedChange('');
        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
          format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));

      }, bulkReq, options);
    });
  }

  doBulkAction($event) {
    const value = $event.target.value;
    if (value === 'publish') {
      const pageIds = this.pages.filter((p) => p.checked).map((p) => p.entityId);
      if (pageIds.length > 0) {
        this.confirmPublishPopup.show(pageIds);
      }
    } else if( value === 'unpublish'){
      const $pages = this.pages.filter(p => p.checked &&
                                            (p.status === PAGE_STATUS.LIVE || p.status === PAGE_STATUS.UPDATED));
      this.confirmUnpublishBulkPopup.show($pages);
    } else if( value === 'delete'){
      const $pages = this.pages.filter(p => p.checked);
      this.confirmDeleteBulkPopup.show($pages);
    }
    $event.target.value = '';
  }

  resetSearch() {
    this.search = cloneDeep(this.defaultSearch);
    this.autoSuggestion.clear();
    this.searchPages();
  }

  assignResult = (result, pageConfigs) => {
    result.content.map((p) => {
      p.data.info.type = this.getConfig(pageConfigs, ['pageTypes'], p.data.info.type);
      p.data.meta.pageSubType = this.getConfig(pageConfigs, this.pageSubTypes, p.data.meta.pageSubType);
      p.imageUrl = p.data.info.logoThumbnail;
      p.checked = false;

      return p;
    })
    this.pages = this.pages.concat(result.content);
    this.totalPages = result.totalItems;
    this.hasMore = result.content.length === this.search.pageSize;
  }

  getConfig = (configs, types, id) => {
    let configName = id;
    if (types) {
      types.forEach(type => {
        let result = configs && configs[type] ? configs[type] : [];
        for (let i = 0; i < result.length; i++) {
          if (result[i].code === id) {
            configName = result[i].names[0].text;
            break;
          }
        }
      });
    }
    return configName;
  }

  listSelected($event) {
    this.search.keywords = $event.map((k) => k.id);
    this.searchPages();
  }

  showPublishCondition(row) {
    return row.status !== PAGE_STATUS.LIVE && row.status !== PAGE_STATUS.READY;
  }

  showUnpublishCondition(row) {
    return row.status === PAGE_STATUS.LIVE || row.status === PAGE_STATUS.UPDATED;
  }

  getPagesSeleted(){
    return this.pages.filter(p => p.checked);
  }

  clearChecked() {
    this.pages.forEach(x => x.checked = false);
  }
}
