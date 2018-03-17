import {
    Component, OnInit, Input, Output, OnChanges, SimpleChanges, ChangeDetectionStrategy, EventEmitter, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { PageActions, AlertsActions } from 'state';
import { FORM_STATE, NOTIFICATION_MESSAGE, NOTIFICATION_TYPE, PAGE_GROUP_STATUS, CONTENT_TYPE } from 'constant';
import { PageGroupData} from './page-groups.model';
import { LocalStorageService } from 'ngx-webstorage';
import { storageConfigs } from 'configs';
import { PageGroupService, WorkflowService } from 'services'
import { PageGroupModel } from './page-groups.model';
import { PageService } from 'services';
import { dateFormatter } from 'utils/formatters';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { SearchCriteria } from 'models';

import cloneDeep from 'lodash/cloneDeep';
import * as format from 'string-format';

@Component({
    selector: 'page-groups.component',
    templateUrl: 'page-groups.component.html'
})

export class PageGroupComponent {
  @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishBulkPopup') public confirmUnpublishBulkPopup: MBCConfirmationComponent;
  @ViewChild('activatedPopup') public activatedPopup: MBCConfirmationComponent;
  @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
  @ViewChild('confirmDeleteBulkPopup') public confirmDeleteBulkPopup: MBCConfirmationComponent;

  public search: SearchCriteria = new SearchCriteria();
  public pages: Array<PageGroupModel> = [];
  public totalPages: number;
  public loading: boolean = true;
  public dateFormatter = dateFormatter;
  public hasMore: boolean;
  public hasUnpublishItems: boolean = false;
  public hasSelectedItems: boolean = false;
  public message = NOTIFICATION_MESSAGE;
  public filterOptions = [];

  constructor(
    private alertsActions: AlertsActions,
    private pageServices: PageService,
    private storage: LocalStorageService,
    private pageGroupService: PageGroupService,
    private workflowService: WorkflowService,
    private router: Router,
    private localStorageService: LocalStorageService) {
  }

  public bulkActions = [{
    value: 'activate',
    text: 'Publish',
    isValid: () => this.showPublishBulkAction()
  },{
    value: 'unpublish',
    text: 'Un-publish',
    isValid: () => this.hasUnpublishItems
  },{
    value: 'delete',
    text: 'Delete',
    isValid: () => this.hasSelectedItems
  }];

  public filterFields =[
    {value: 'status',text: 'Status'},
    {value: 'data.type',text: 'Type'}
  ]

  ngOnInit() {
  }

  changeFilterField($event) {
    const searchValue: string = $event.target.value;
    this.filterOptions = [];
    switch(searchValue){
      case 'status':
        this.filterOptions = [
          { id: PAGE_GROUP_STATUS.LIVE, value: 'Live' },
          { id: PAGE_GROUP_STATUS.UPDATED, value: 'Updated' },
          { id: PAGE_GROUP_STATUS.DRAFT, value: 'Draft' },
          { id: PAGE_GROUP_STATUS.INACTIVE, value: 'Unpublished' }
        ];
        break;
      case 'data.type':
        let pageTypes = [];
        const pageConfigs = this.localStorageService.retrieve(storageConfigs.page);
        if (pageConfigs && pageConfigs !== null) {
            pageTypes = pageConfigs['pageTypes'];
        } else {
            this.localStorageService
                .observe(storageConfigs.page)
                .subscribe(x => {
                    pageTypes = x['pageTypes'];
                })
        }
        pageTypes.forEach(x=>{
          this.filterOptions.push({
            id : x.code,
            value: x.names[0].text
          });
        });
        break;
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
    this.search.type = 'pageGroup';
    this.pageServices.searchPages(this.search).subscribe(result =>
      { const pageConfigs = this.storage.retrieve(storageConfigs.page);
        this.assignResult(result, pageConfigs)
        this.loading = false;
      });
  }

  newSearch($event) {
    this.search = $event;
    this.hasMore = true;
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
    return `/page-groups/detail/${entry.entityId}`
  }

  editPage($event) {
    const pageId = $event.entry.entityId;
    this.router.navigate(['page-groups', 'detail', `${pageId}`]);
  }

  publish($event) {
    const pageId = $event.entry.entityId;
    this.confirmPublishPopup.show([pageId]);
    $event.event.target.value = '';
  }

  activatePageGroups(pageGroupIds: Array<string>) {
    this.pageGroupService.activatePageGroups(pageGroupIds).subscribe(result => {
      let activated = [];
      for (let i = 0; i < result.length; i++) {
        const publishedPage = result[i];
        for (let j = 0; j < this.pages.length; j++) {
          const page = this.pages[j];
          if (page.entityId === publishedPage.entityId) {
            activated.push(page.data.title);
            page.checked = false;
            page.status = publishedPage.status;
            page.publishedDate = publishedPage.publishedDate;
          }
        }
      }

      const bulkReq = pageGroupIds.map(id => ({
        entityId: id,
        entityType: CONTENT_TYPE.PAGE_GROUP
      }));

      let options = {
        currentStatus: [PAGE_GROUP_STATUS.INACTIVE, PAGE_GROUP_STATUS.DRAFT],
        targetStatus: PAGE_GROUP_STATUS.LIVE
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

        if (activated.length) {
          let msg = '';
          if (activated.length == 1) {
            msg = 'The page ' + activated[0] + ' is successfully published.';
          } else {
            msg = 'The following pages are successfully published:';
            msg += '<ul>';
            activated.map(page => msg += '<li>' + page + '</li>');
            msg += '</ul>';
          }
          this.alertsActions.showSuccess(msg);
        }
      }, bulkReq, options);
    });
  }

  showActivatedMessage(activated: Array<string>) {
    if(activated.length) {
      let msg;
      if(activated.length == 1) {
          msg = 'The page ' + activated[0] + ' is successfully published. This Page Group now is available to add the page children.';
      } else {
        msg = 'The following pages are successfully published. These Page Group now are available to add the page children:';
        msg += '<ul>'
        activated.map((page) => msg += '<li>' + page + '</li>')
        msg += '</ul>'
      }
      this.activatedPopup.message = msg;
      this.activatedPopup.show();
    }
  }

  assignResult = (result, pageConfigs) => {
    result.content.map((p) => {
      p.data.type = this.getConfig(pageConfigs, 'pageTypes', p.data.type);
      p.checked = false;
      return p;
    })
    this.pages = this.pages.concat(result.content);
    this.totalPages = result.totalItems;
    this.hasMore = result.content.length === this.search.pageSize;
  }

  getConfig = (configs, type, id) => {
    let types = configs && configs[type] ? configs[type] : [];
    for (let i = 0; i < types.length; i++) {
      if (types[i].code === id) {
        return types[i].names[0].text;
      }
    }
    return id;
  }

  doBulkAction($event) {
    const value = $event.target.value;
    if (value === 'activate') {
      const pageIds = this.pages.filter((p) => p.checked).map((p) => p.entityId);
      if (pageIds.length > 0) {
        this.confirmPublishPopup.show(pageIds);
      }
    } else if( value === 'unpublish'){
      const $items = this.pages.filter(p => p.checked && p.status === PAGE_GROUP_STATUS.LIVE);
      this.confirmUnpublishBulkPopup.show($items);
    } else if( value === 'delete'){
      const $items = this.pages.filter(p => p.checked);
      this.confirmDeleteBulkPopup.show($items);
    }
    $event.target.value = '';
  }

  getPageSelected(){
    return this.pages.filter((p) => p.checked);
  }

  showPublishBulkAction(){
     return this.pages.filter(p => p.checked
      && p.status !== PAGE_GROUP_STATUS.LIVE && p.status !== PAGE_GROUP_STATUS.READY).length > 0;
  }

  showPublishCondition(row) {
    return row.status !== PAGE_GROUP_STATUS.LIVE && row.status !== PAGE_GROUP_STATUS.READY;
  }

  /**
   * Show unpublish option when page group is live
   * @param row the page group row
   */
  showUnpublishCondition(row) {
    return PAGE_GROUP_STATUS.LIVE === row.status;
  }
  /**
   * Confirm unpublish a page group
   * @param  the page group
   */
  confirmUnpublish($event){
    const $pageGroup = $event.entry;
    this.confirmUnpublishPopup.show($pageGroup);
    $event.event.target.value = '';
  }

  /**
   * Confirm delete a page group
   */
  confirmDelete($event) {
    const $pageGroup = $event.entry;
    this.confirmDeletePopup.show($pageGroup);
    $event.event.target.value = '';
  }

  /**
   * Invoke workflow unpublish a page group
   * @param  the page group
   */
  unpublishPageGroup($pageGroup){
    const pageGroupId = $pageGroup.entityId;
    this.workflowService.unpublish(CONTENT_TYPE.PAGE_GROUP, pageGroupId)
      .subscribe(res => {
        $pageGroup.status = res.status;

        if (PAGE_GROUP_STATUS.UNPUBLISH === $pageGroup.status) {
           let options = {
            currentStatus: PAGE_GROUP_STATUS.UNPUBLISH,
            targetStatus: PAGE_GROUP_STATUS.INACTIVE
          };

          this.workflowService.getStatusInterval((variables) => {
            $pageGroup.status = variables.status;

            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
              format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-published'));
          }, CONTENT_TYPE.PAGE_GROUP, pageGroupId ,options);
        }

      });
  }

  /**
   * Invoke workflow delete the page group
   * @param  the page group
   */
  onDelete($pageGroup){
    const pageGroupId = $pageGroup.entityId;
    this.pageGroupService.deleteRelatives( [ pageGroupId ] ).subscribe(delRes => {
      this.workflowService.delete(CONTENT_TYPE.PAGE_GROUP, pageGroupId)
        .subscribe(res => {
          let index = this.pages.findIndex(item => item.entityId === pageGroupId);
          this.pages.splice(index, 1);
          this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
        });
      });
  }

  /**
   * Show hide unpublish bulk option when seleted item
   * @param  the selected item
   */
  itemSelectedChange($event){
    this.hasSelectedItems = this.pages.filter(p => p.checked).length > 0;

    this.hasUnpublishItems = this.hasSelectedItems
      && this.pages.filter(p => p.checked
      && p.status === PAGE_GROUP_STATUS.LIVE).length > 0;
  }

  /**
   * Invoke workflow unpublish bulk page groups
   * @param  list of page groups
   */
  unpublishBulkPageGroups($items) {
    const unpublishBulkReq = $items.map(pageGroup => ({
      entityId: pageGroup.entityId,
      entityType: CONTENT_TYPE.PAGE_GROUP
    }));

    this.workflowService.unpublishBulk(unpublishBulkReq).subscribe(result => {
      $items.forEach($pageGroup => {
        $pageGroup.checked = false;
        $pageGroup.status = result.filter(p => p.entityIdentifier.entityId === $pageGroup.entityId)
          .map(p => p.status)[0];
      });
    });

    let options = {
      currentStatus: PAGE_GROUP_STATUS.UNPUBLISH,
      targetStatus: PAGE_GROUP_STATUS.INACTIVE
    };
    this.workflowService.getBulkStatusInterval((result) => {
      $items.forEach($pageGroup => {
        var status = result.filter(p => p.entityIdentifier.entityId === $pageGroup.entityId)
          .map(p => p.status)[0];
        if (status) {
          $pageGroup.status = status;
        }
      });
      this.itemSelectedChange($items);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-published'));
    }, unpublishBulkReq, options);
  }

  /**
   * Invoke workflow delete bulk page groups
   * @param  list of page groups
   */
  onDeleteBulk($items) {
    const bulkReq = $items.map(pageGroup => ({
      entityId: pageGroup.entityId,
      entityType: CONTENT_TYPE.PAGE_GROUP
    }));

    const pageGroupIds = $items.map(pg => pg.entityId);

    this.pageGroupService.deleteRelatives(pageGroupIds).subscribe(delRes => {
      this.workflowService.deleteBulk(bulkReq).subscribe(result => {
        $items.forEach(pageGroup => {
          let index = this.pages.findIndex(item => item.entityId === pageGroup.entityId);
          this.pages.splice(index, 1);
        });
        this.itemSelectedChange($items);
        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
          format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
      }, error =>{
        console.log('onDeleteBulk page group failed');
        return;
      });
    });
  }
}
