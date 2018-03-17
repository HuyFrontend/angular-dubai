import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/delay';
import cloneDeep from 'lodash/cloneDeep';
import { LocalStorageService } from 'ngx-webstorage';
import { PageService, WorkflowService, AppConfigService } from 'services';
import { PostActions, ContentActions } from 'state';
import { Content, SearchCriteria, PageSuggestionRequest } from 'models';
import { storageConfigs } from 'configs';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { SearchCriteriaComponent } from 'components/searchCriteria';
import { CONTENT_STATUS, CONTENT_TYPE, NOTIFICATION_MESSAGE, NOTIFICATION_TYPE, MODERATE_ACTION} from 'constant';
import { dateFormatter } from 'utils/formatters';
import { getDateFormat } from 'utils';
import { AlertsActions } from 'state';
import * as format from 'string-format';
import { getInterestSuggestions, getAllInterestNode } from 'utils/config-helper';

@Component({
  selector: 'content',
  templateUrl: 'content.html'
})

export class ContentComponent {
  @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishContentPopup') public confirmUnpublishContentPopup: MBCConfirmationComponent;
  @ViewChild('confirmModeratePopup') public confirmModeratePopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishBulkPopup') public confirmUnpublishBulkPopup: MBCConfirmationComponent;
  @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
  @ViewChild('confirmDeleteBulkPopup') public confirmDeleteBulkPopup: MBCConfirmationComponent;

  private search: SearchCriteria = new SearchCriteria();
  public pages: Array<Content> = [];
  public totalContents: number;
  public filterOptions = [];
  public loading: boolean = true;
  public isRemoteSuggestion: boolean = false;

  public hasMore: boolean;
  public hasUnpublishItems: boolean = false;
  public hasSelectedItems: boolean = false;
  public dateFormatter = dateFormatter;
  public message = NOTIFICATION_MESSAGE;

  private defaultImage = '/assets/images/default-image.gif';

  constructor(
    private postActions: PostActions,
    private contentActions: ContentActions,
    private workflowService: WorkflowService,
    private pageServices: PageService,
    private storage: LocalStorageService,
    private alertsActions: AlertsActions,
    private router: Router,
    private config: AppConfigService) {
  }

  ngOnInit() {
  }

  public bulkActions = [{
    value: 'publish',
    text: 'Publish',
    isValid: () => this.getPagesForPublish().length > 0
  },{
    value: 'approve',
    text: 'Approve',
    isValid: () => this.getPagesForModerate().length > 0
  },{
    value: 'reject',
    text: 'Reject',
    isValid: () => this.getPagesForModerate().length > 0
  },{
    value: 'unpublish',
    text: 'Un-publish',
    isValid: () => this.hasUnpublishItems
  },{
    value: 'delete',
    text: 'Delete',
    isValid: () => this.hasSelectedItems
  }];

  sort(field) {
    if (this.search.orderBy !== field) {
      this.search.orderDir = 'sorting_asc';
    } else {
      this.search.orderDir = this.search.orderDir === 'sorting_asc' ? 'sorting_desc' : 'sorting_asc';
    }
    this.search.orderBy = field;
    this.search.page = 0; //search from begining
    this.pages = [];
    this.searchContent();
  }

  searchContent($event = { id: '', name: '' }) {
    this.loading = true;
    this.search.type = 'article,post';
    this.pageServices.searchPages(this.search).subscribe(result => {
                                      const pageConfigs = this.storage.retrieve(storageConfigs.page);
                                      this.assignResult(result, pageConfigs)
                                      this.loading = false;
                                    });
  }

  newSearch($event) {
    this.search = $event;
    this.hasMore = true;
    this.pages = [];
    this.searchContent();
  }

  loadMore($event) {
    if (this.hasMore && !this.loading) {
      this.loading = true;
      this.search.page += 1;
      this.searchContent();
    }
  }

  changeFilterField($event) {
    const searchValue: string = $event.target.value;

    this.filterOptions = [];
    this.isRemoteSuggestion = false;

    switch(searchValue){
      case 'data.language':
        this.filterOptions = [
          { id: 'en', value: 'English' },
          { id: 'ar', value: 'Arabic' }
        ];
        break;
      case 'status':
        this.filterOptions = [
          { id: 'live', value: 'Live' },
          { id: 'updated', value: 'Updated' },
          { id: 'draft', value: 'Draft' },
          { id: 'inactive', value: 'Unpublished' },
          { id: 'rejected', value: 'Rejected' },
          { id: 'pending', value: 'Pending Approval' },
        ];
        break;
      case 'type':
        this.filterOptions = [
          { id: 'text', value: 'Text' },
          { id: 'image', value: 'Image' },
          { id: 'embed', value: 'Link' },
          { id: 'article', value: 'Article' },
        ];
        break;
      case 'publish.internalUniquePageName':
      case 'tag.internalUniquePageName':
      case 'data.interests':
        this.isRemoteSuggestion = true;
        break;
    }
  }

  public filterFields =[
    {value: 'data.language', text: 'Language'},
    {value: 'publish.internalUniquePageName',text: 'Page'},
    {value: 'status',text: 'Status'},
    {value: 'tag.internalUniquePageName',text: 'Tag'},
    {value: 'type',text: 'Type'},
    {value: 'data.interests',text: 'Interest'}
  ]

  remoteSuggest({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    if (this.search.field === 'publish.internalUniquePageName') {
      this.pageServices
          .suggest(new PageSuggestionRequest('publishOnBehalf', val))
          .subscribe(listPage => {
            this.filterOptions = listPage.map((p) => {
              return {id: p.internalUniquePageName, value: p.internalUniquePageName}
            })
            _updateEvent.next(this.filterOptions);
          });
    } else if (this.search.field === 'tag.internalUniquePageName') {
      this.pageServices
          .suggest(new PageSuggestionRequest('tag', val))
          .subscribe(listPage => {
            this.filterOptions = listPage.map((p) => {
              return {id: p.internalUniquePageName, value: p.internalUniquePageName}
            })
            _updateEvent.next(this.filterOptions);
          });
    } else if (this.search.field === 'data.interests'){
        this.config.fetchInterestConfigs().subscribe(x=>{
            this.filterOptions = getInterestSuggestions(val, x);
            _updateEvent.next(this.filterOptions);
        });
    }
  }

  editContent($event) {
    const entityId = $event.entry.entityId;
    const type = $event.entry.type;
    const page = CONTENT_TYPE.ARTICLE === type ? CONTENT_TYPE.ARTICLE : CONTENT_TYPE.POST;
    this.router.navigate(['content', page, entityId]);
  }

  copyContent($event) {
    const entityId = $event.entry.entityId;
    const type = $event.entry.type;
    if(type === CONTENT_TYPE.ARTICLE) {
      this.contentActions.copyArticle(entityId).subscribe(entityId => {
        this.router.navigate(['content', CONTENT_TYPE.ARTICLE], { queryParams: { copyFromId: entityId } });
      });
    } else {
      this.postActions.copyPost(entityId).subscribe(result => {
        this.router.navigate(['content', CONTENT_TYPE.POST], { queryParams: { copyFromId: entityId } });
      });
    }
  }

  getDetailUrl(entry) {
    const entityId = entry.entityId;
    const type = entry.type;
    const page = CONTENT_TYPE.ARTICLE === type ? CONTENT_TYPE.ARTICLE : CONTENT_TYPE.POST;
    return `/content/${page}/${entityId}`
  }

  getPage(publishOnBehalf) {
    if (publishOnBehalf && publishOnBehalf.length) {
      return publishOnBehalf[0]['data.info.internalUniquePageName']
    }
  }

  assignResult = (result, pageConfigs) => {
    result.content.map((p) => {
      p.checked = false;
      p.website = 'www.mbc.net'; // Temporary hard code
      p.publishOnBehalf = this.getPage(p.data.relationships.publishOnBehalf);
      p.imageUrl = p.data.articlePhoto || p.data.image || this.defaultImage;
      if (p.publishedDate) {
        p.publishedDate = p.publishedDate;
      }
      return p;
    })
    this.pages = this.pages.concat(result.content);
    this.totalContents = result.totalItems;
    this.hasMore = result.content.length === this.search.pageSize
  }

  listSelected($event) {
    this.search.keywords = $event.map((k) => k.id);
    this.searchContent();
  }

  showPublishCondition(row) {
    return row.status !== CONTENT_STATUS.LIVE &&
          row.status !== CONTENT_STATUS.READY &&
          row.status !== CONTENT_STATUS.PENDING;
  }

  /**
   * Show unpublish option when content is live
   * @param row the content row
   */
  showUnpublishCondition(row) {
    return CONTENT_STATUS.LIVE === row.status || CONTENT_STATUS.UPDATED === row.status;
  }
  /**
   * Confirm unpublish content
   * @param  the content
   */
  confirmUnpublishContent($event){
    const $content = $event.entry;
    this.confirmUnpublishContentPopup.show($content);
    $event.event.target.value = '';
  }

  confirmDelete($event) {
    const $page = $event.entry;
    this.confirmDeletePopup.show($page);
    $event.event.target.value = '';
  }

  /**
   * Unpublish a content
   * @param  the content
   */
  unpublishContent($content) {
    const contentId = $content.entityId;
    const contentType = this.getEntityType($content.type);
    this.workflowService.unpublish(contentType, contentId)
      .subscribe(res => {
        $content.status = res.status;
        if (CONTENT_STATUS.UNPUBLISH === $content.status) {
          let options = {
            currentStatus: CONTENT_STATUS.UNPUBLISH,
            targetStatus: CONTENT_STATUS.INACTIVE
          };

          this.workflowService.getStatusInterval((variables) => {
            $content.status = variables.status;
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                    format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                                    'Un-published'));
          }, contentType, contentId, options);
        }
      });
  }

  /**
   * Delete the content
   * @param  the content
   */
  onDelete($content) {
    const contentId = $content.entityId;
    const contentType = this.getEntityType($content.type);
    this.workflowService.delete(contentType, contentId).subscribe(res => {
      let index = this.pages.findIndex(item => item.entityId === contentId);
      this.pages.splice(index, 1);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
    });
  }

  showModerateCondition(row) {
    return row.status === CONTENT_STATUS.PENDING;
  }

  publishAContent($event) {
    const entityId = $event.entry.entityId;
    const contentType = this.getEntityType($event.entry.type);
    this.confirmPublishPopup.show({entityId, contentType, isSingle:true});
    $event.event.target.value = '';
  }

  publishContent(contents) {
    const arrStatus: string[] = [CONTENT_STATUS.LIVE, CONTENT_STATUS.READY, CONTENT_STATUS.PENDING];
    let contentForPublish = [];

    if (contents.isSingle) {
      contentForPublish.push({entityId: contents.entityId, entityType: contents.contentType});
    } else {
      contentForPublish = contents
                            .filter(content => arrStatus.indexOf(content.status) === -1)
                            .map(content => ({
                              entityId: content.entityId,
                              entityType: this.getEntityType(content.type)
                            }));
    }
    this.workflowService.publishBulk(contentForPublish).subscribe(result => {
      this.clearChecked();
      for (let i = 0, l = this.pages.length; i < l; i++) {
        const page = this.pages[i];
        let resultFilter = result.filter(item => item.entityIdentifier.entityId === page.entityId);

        if (resultFilter.length > 0) {
          page.status = resultFilter[0].status;
          //page.publishedDate = new Date();
        }
      }
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
    });

    let options = {
      currentStatus: [CONTENT_STATUS.DRAFT, CONTENT_STATUS.INACTIVE, CONTENT_STATUS.UNPUBLISH, CONTENT_STATUS.REJECTED, CONTENT_STATUS.UPDATED, CONTENT_STATUS.CHECKING_MODERATE],
      targetStatus: CONTENT_STATUS.PENDING
    };

    this.workflowService.getBulkStatusInterval(result => {
      this.pages.forEach($page => {
        var status = result.filter(p => p.entityIdentifier.entityId === $page.entityId)
          .map(p => p.status)[0];
        if (status) {
          $page.status = status;
        }
      });
    }, contentForPublish, options);
  }

  onModerateContentPopup($event, moderateAction:string) {
    this.confirmModeratePopup.message = this.moderateActionMessage(moderateAction);
    this.confirmModeratePopup.displayComment = (moderateAction == 'reject');
    this.confirmModeratePopup.show({  entityType: this.getEntityType($event.entry.type),
                                      entityId: $event.entry.entityId,
                                      action: moderateAction,
                                      isSingle:true
                                    });
    $event.event.target.value = '';
  }

  onModerateContent($event) {
    let contentForModerate = [];
    if($event.isSingle){
        contentForModerate.push({entityId: $event.entityId, entityType: $event.entityType});
    }
    else {
        contentForModerate = $event.pages.filter(row=>row.status === CONTENT_STATUS.PENDING)
                                  .map(row => ({
                                    entityId: row.entityId,
                                    entityType: this.getEntityType(row.type)
                                  }));
    }

    const res = this.workflowService.executeWorkflows(contentForModerate,
                                                      'moderateEntity',
                                                      {moderateAction : $event.action,
                                                      comment: $event.comment})
                .subscribe(result => {
                      this.clearChecked();
                      for (let j = 0; j < this.pages.length; j++) {
                        const page = this.pages[j];
                        var resultFilter = result.filter(x=>x.entityIdentifier.entityId === page.entityId);

                        if (resultFilter.length > 0) {
                          page.status = resultFilter[0].status;
                        }
                      }

                      if(MODERATE_ACTION.APPROVE == $event.action){
                        let options = {
                          currentStatus: [CONTENT_STATUS.PENDING, CONTENT_STATUS.READY],
                          targetStatus: CONTENT_STATUS.LIVE
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

                        }, contentForModerate, options);
                      }

                      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                              ($event.action == MODERATE_ACTION.REJECT ? 'Rejected' :'Approved') + ' successfully');
                  });
  }

  itemSelectedChange($event){
    this.hasSelectedItems = this.pages.filter(p => p.checked).length > 0;

    this.hasUnpublishItems = this.hasSelectedItems
      && this.pages.filter(p => p.checked
      && (p.status === CONTENT_STATUS.LIVE || p.status === CONTENT_STATUS.UPDATED)).length > 0;
  }

  /**
   * Invoke workflow unpublish bulk contents
   * @param  list of contents
   */
  unpublishBulkContents($items) {
    const unpublishBulkReq = $items.map(content => ({
      entityId: content.entityId,
      entityType: this.getEntityType(content.type)
    }));

    this.workflowService.unpublishBulk(unpublishBulkReq).subscribe(result => {
      $items.forEach($content => {
        $content.checked = false;
        $content.status = result.filter(p => p.entityIdentifier.entityId === $content.entityId)
          .map(p => p.status)[0];
      });
    });

    let options = {
      currentStatus: CONTENT_STATUS.UNPUBLISH,
      targetStatus: CONTENT_STATUS.INACTIVE
    };
    this.workflowService.getBulkStatusInterval((result) => {
      $items.forEach($content => {
        var status = result.filter(p => p.entityIdentifier.entityId === $content.entityId)
          .map(p => p.status)[0];
        if (status) {
          $content.status = status;
        }
      });

      this.itemSelectedChange($items);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-published'));
    }, unpublishBulkReq, options);
  }

  /**
   * Invoke workflow delete bulk contents
   * @param  list of contents
   */
  onBulkDelete($items) {
    const bulkReq = $items.map(content => ({
      entityId: content.entityId,
      entityType: this.getEntityType(content.type)
    }));

    this.workflowService.deleteBulk(bulkReq).subscribe(result => {
      $items.forEach(content => {
        let index = this.pages.findIndex(item => item.entityId === content.entityId);
        this.pages.splice(index, 1);
      });

      this.itemSelectedChange($items);
      this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
    });
  }

  doBulkAction($event) {
    const value = $event.target.value;
    if (value === 'publish') {
      const pages = this.getPagesForPublish();
      if (pages.length > 0) {
        this.confirmPublishPopup.show(pages);
      }
    } else if( value === 'unpublish'){
      const $items = this.pages.filter(p => p.checked && p.status === CONTENT_STATUS.LIVE);
      this.confirmUnpublishBulkPopup.show($items);
    } else if( value === 'delete'){
      const $items = this.pages.filter(p => p.checked);
      this.confirmDeleteBulkPopup.show($items);
    } else if (value === 'approve' || value === 'reject') {
      const pages = this.pages.filter((p) => p.checked);
      if (pages.length > 0) {
        this.confirmModeratePopup.message= this.moderateActionMessage(value);
        this.confirmModeratePopup.displayComment = (value == 'reject');
        this.confirmModeratePopup.show({pages, action: value});
      }
    }
    $event.target.value = '';
  }

  moderateActionMessage(moderateAction) {
      let message = '';
      if(moderateAction == 'approve'){
        message = 'Approval results in pushing content to front office sites. Do you want to proceed?';
      }
      if(moderateAction == 'reject'){
        message ='Rejection sends the content back to content publisher. Do you want to proceed?';
      }
      return message;
  }

  getEntityType(type) {
    return CONTENT_TYPE.ARTICLE === type ? CONTENT_TYPE.ARTICLE : CONTENT_TYPE.POST;
  }

  clearChecked(){
    this.pages.forEach(x=>x.checked = false);
  }

  getPageSelected(){
    return this.pages.filter((p) => p.checked);
  }

  getPagesForModerate(){
    return this.pages.filter((p) => p.checked && p.status == CONTENT_STATUS.PENDING);
  }

  getPagesForPublish(){
    return this.pages.filter((p) => p.checked && p.status !== CONTENT_STATUS.LIVE &&
                                              p.status !== CONTENT_STATUS.READY &&
                                              p.status !== CONTENT_STATUS.PENDING);
  }
}
