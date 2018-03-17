import {
    Component, OnInit, Input, Output, OnChanges, SimpleChanges, ChangeDetectionStrategy, EventEmitter, ViewChild
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { PageActions, AlertsActions } from 'state';
import { FORM_STATE, PAGE_STATUS, PAGE_GROUP_STATUS ,CONTENT_TYPE,
    NOTIFICATION_TYPE, NOTIFICATION_MESSAGE } from 'constant';
import { PageGroupData, PageGroupModel } from './page-groups.model';
import { LocalStorageService } from 'ngx-webstorage';
import { storageConfigs } from 'configs';
import { PageService, WorkflowService } from 'services';
import { PageSuggestionRequest } from 'models';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PageInfoDetail } from './page-detail.model';
import { dateFormatter } from 'utils/formatters';
import { PageGroupService, ContentService } from 'services';
import { MBCMultipleSuggestionComponent } from 'components/multipleSuggestion';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import cloneDeep from 'lodash/cloneDeep';
import * as format from 'string-format';
import { nospaceValidator } from 'utils/validator';

@Component({
    selector: 'group-create.component',
    templateUrl: 'group-create.component.html',
    styleUrls: ['group-create.component.scss']
})

export class GroupDetailComponent implements OnInit {
    @ViewChild('suggestPage') public suggestPage: MBCMultipleSuggestionComponent;
    @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
    @ViewChild('confirmShortcutPublishPopup') public confirmShortcutPublishPopup: MBCConfirmationComponent;
    @ViewChild('activatedPopup') public activatedPopup: MBCConfirmationComponent;
    @ViewChild('confirmDetachPages') public confirmDetachPages: MBCConfirmationComponent;
    @ViewChild('confirmDetachPageSuccess') public confirmDetachPageSuccess: MBCConfirmationComponent;
    @ViewChild('confirmSetDefaultPage') public confirmSetDefaultPage: MBCConfirmationComponent;
    @ViewChild('confirmSaveAndPublishPopup') public confirmSaveAndPublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmClosePopup') public confirmClosePopup: MBCConfirmationComponent;

    public pageGroup: PageGroupData;
    public pageTypes: string[];
    public pageGroupForm: FormGroup;

    public groupId: string;
    public groupStatus: string;

    public isFormSubmitted: boolean = false;
    public isInfoValid: boolean = false;
    public sentOneRequest: boolean = false;
    public listPageSelected: any = [];
    public selectedPageEntries: any = [];
    public selectedPageEntry: any;
    public listPagesInGroup: Array<PageInfoDetail> = [];
    public listPages: any = [];
    public loading: boolean = true;
    public hasMore: boolean;
    public dateFormatter = dateFormatter;
    public existedPage: boolean = false;
    public pageGroupStatus = PAGE_GROUP_STATUS;
    public originalValue: string = '';
    public action: string = 'Edit';

    private defaultSearch = {
        field: '',
        keywords: [],
        orderBy: 'createdAt',
        orderDir: 'sorting_desc',
        page: 0
    };

    private isSaveAndPublish: boolean =  false;
    private pageSize: number = 20;
    private invalidTagToPages: boolean;
    private pageStatus: any = PAGE_STATUS;
    private displayLoader:boolean = false;

    public message = NOTIFICATION_MESSAGE;
    public totalPages: number;
    public search = cloneDeep(this.defaultSearch);
    public isAdding: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private alertsActions: AlertsActions,
        private localStorageService: LocalStorageService,
        private pageGroupService: PageGroupService,
        private pageServices: PageService,
        private workflowService: WorkflowService,
        private contentService: ContentService
    ) {
        this.pageGroup = new PageGroupData();
        this.initFormGroup(this.pageGroup);
        const pageConfigs = this.localStorageService.retrieve(storageConfigs.page);
        if (pageConfigs && pageConfigs !== null) {
            this.pageTypes = pageConfigs['pageTypes'];
        } else {
            this.localStorageService
                .observe(storageConfigs.page)
                .subscribe(x => {
                    this.pageTypes = x['pageTypes'];
                })
        }
    }

    onBeforeClose(): void {
      if (this.pageGroupForm.dirty) {
        this.confirmClosePopup.show();
      }
      else{
        this.onClose();
      }
    }

    onClose() {
      this.router.navigate(['/page-groups']);
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.groupId = params.groupId;
            this.pageGroupService.fetchPageGroupById(this.groupId).subscribe(result => {
                if (result.entityId) {
                    this.pageGroup = result.data;
                    this.pageGroup.entityId = result.entityId;
                    this.pageGroup.groupStatus = result.status;
                    this.initFormGroup(this.pageGroup);
                    this.getListPageChild();
                } else {
                    this.sentOneRequest = false;
                }
            }, error => this.sentOneRequest = false)
        });
    }

    initFormGroup(pageGroup: PageGroupData) {
      if (pageGroup) {
        this.pageGroupForm = new FormGroup({
          type: new FormControl(pageGroup.type, [Validators.required]),
          title: new FormControl(pageGroup.title, [Validators.required], this.validateUniquePageGroup.bind(this)),
          followAllPages: new FormControl(pageGroup.followAllPages),
          instantPublishAllPages: new FormControl(pageGroup.instantPublishAllPages)
        });

        this.originalValue = pageGroup.title;

        this.pageGroupForm.controls.type.valueChanges.subscribe( newVal => {
          this.pageGroup.type = newVal;
        })
      }
    }

    validateUniquePageGroup(control: AbstractControl) {
      const value: string = control.value;

      return new Promise(resolve => {
        if (value !== this.originalValue) {
          this.contentService.checkExist('data.title', value).subscribe(res => {
            if (res.result) {
              resolve({asyncInvalid: true});
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      });
    }

    confirmSaveAndPublish($event){
      this.confirmSaveAndPublishPopup.show();
    }

    onSaveAndPublish(){
      this.isSaveAndPublish = true;
      this.onSubmit(this.pageGroupForm.value, this.pageGroupForm.valid);
  }

    onSubmit(model: PageGroupData, isValid: boolean) {
      this.invalidTagToPages = false;
      if (isValid && !this.sentOneRequest) {
        this.sentOneRequest = true;
        const entity = { data: model, entityId: this.pageGroup.entityId }
        this.pageGroupService.save(entity).subscribe(x => {
          if (!entity.entityId) {
            const { entityId } = x;
            this.router.navigate([`/page-groups/${entityId}`]);
          } else {
            this.sentOneRequest = false;
          }
          if(this.isSaveAndPublish){
            this.activatePageGroups([entity.entityId]);
          }
          this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, 'Saved successfully');
        }, error => this.sentOneRequest = false);

        if (this.pageGroup.groupStatus === 'live') {
          this.workflowService.getStatusInterval(variables => {
            this.pageGroup.groupStatus = variables.status;
          }, CONTENT_TYPE.PAGE_GROUP, entity.entityId, {targetStatus: 'modified'});
        }
      }
    }

    sort(field) {
        // TODO: Need to update
    }

    loadMore($event) {
        // TODO: Need to update
    }

    onQueryPage({val, updateEvent}) {
      this.invalidTagToPages = false;
      let excludeIds: any = this.listPagesInGroup.map(item => item.id);
      this.pageServices.suggest(new PageSuggestionRequest('pageInGroup', val, this.pageGroup.type, null, excludeIds))
        .subscribe(result => {
        this.listPages = result;
        const filteredPages = this.formatPageSuggestion(
          this.listPages.filter(item=> {
            const value = item.internalUniquePageName;
            return value.toLowerCase().indexOf(val.toLowerCase()) > -1;
          })
        );
        const _updateEvent: BehaviorSubject<any> = updateEvent;
        _updateEvent.next(filteredPages);
      });
    }

    onAddedPage(data: any) {
      if (data) {
        this.existedPage = this.listPagesInGroup.filter(p => p.id === data.id).length > 0;
        if (!this.existedPage) {
          this.listPageSelected.push(data);
        }
      }
    }

    onRemovePage(data: any) {
      if (data) {
        this.listPageSelected = this.listPageSelected.filter(item => item.id != data.id);
      }
    }

    formatPageSuggestion = (pages: any[]) => {
      return pages.map(item => {
        const value = item.internalUniquePageName;
        return {
          id: item.entityId,
          value,
          raw: item
        }
      });
    }

    getListPageChild() {
      this.pageGroupService.getListPagesFromPageGroup(this.pageGroup.entityId).subscribe(result => {
        this.listPagesInGroup = result.map(p => this.mapPageInfoModel(p));
      });
    }

    addPageToGroup() {
      if (this.listPageSelected.length <= 0) {
        this.invalidTagToPages = true;
        return ;
      }

      if (!this.isAdding) {
        this.isAdding = true;
        this.pageGroupService.addPageIntoPageGroup(this.listPageSelected.map(x=>x.id), this.pageGroup.entityId)
          .subscribe(result => {
            this.isAdding = false;
            if (result) {
              this.listPagesInGroup = result.map((p) => (this.mapPageInfoModel(p)));
              this.suggestPage.clear();
              this.existedPage = false;
              this.listPageSelected = [];
            }
          });
      }
    }

    defaultPageHandler(entry:any){
        if(entry.isDefaultRelationship){
            return ;
        }
        const defaultPages = this.listPagesInGroup.filter(x=>x.isDefaultRelationship);
        if(defaultPages.length > 0){
            let msg = format('There is {} already indicated as default page for this {}, {}',
                            defaultPages[0].pageTitle,
                            this.pageGroup.title,
                            'do you want to override this default page?');
            this.confirmSetDefaultPage.message = msg;
            this.confirmSetDefaultPage.show(entry);
            return;
        }
        this.updateDefaultPage(entry);
    }

    updateDefaultPage(entry:any){
      this.pageGroupService.updatePageDefaultIntoPageGroup(entry.pageRelationshipId, this.pageGroup.entityId)
      .subscribe(result => {
        if (result) {
          let pagesArray = JSON.parse(result._body),
              defaultPageId: string = '';
          this.listPagesInGroup = pagesArray.map(page => {
            if (page.pageRelationshipResponse.properties.default) {
              defaultPageId = page.page.entityId;
            }
            return this.mapPageInfoModel(page);
          });

          this.updateDefaultPageInSelectedEntries(defaultPageId);
        }
      });
    }

    updateDefaultPageInSelectedEntries(defaultPageId: string) {
      this.selectedPageEntries.map(page => {
        if (page.id === defaultPageId) {
          page.isDefaultRelationship = true;
        } else {
          page.isDefaultRelationship = false;
        }
      });
    }


    movePageHandler(index, seek: number){
        const orderTemp = this.listPagesInGroup[index + seek].relationshipOrder;
        this.listPagesInGroup[index + seek].relationshipOrder = this.listPagesInGroup[index].relationshipOrder;
        this.listPagesInGroup[index].relationshipOrder = orderTemp;
        this.displayLoader = true;
        this.pageGroupService.movePagesFromPageGroup(this.listPagesInGroup, this.pageGroup.entityId)
        .subscribe(result => {
            if (result) {
                let pagesArray = JSON.parse(result._body);
                this.listPagesInGroup = pagesArray.map((p) => (this.mapPageInfoModel(p)));
            }
            this.displayLoader = false;
        });
    }

    detachPage(entry:any){
        let entries = [];
        entries.push(entry);
        this.selectedPageEntry = entry;
        this.confirmDetachPages.message = this.getMsgDetachPage(entries);
        this.confirmDetachPages.show(true);
    }

    detachPages() {
        if(this.selectedPageEntries.length == 0){
            return ;
        }
        this.confirmDetachPages.message = this.getMsgDetachPage(this.selectedPageEntries);
        this.confirmDetachPages.show(false);
    }

    getMsgDetachPage(entries:any[]){
        if(entries.length == 1){
            const entry = entries[0];
            if(entry.isDefaultRelationship){
                return format('The page {} is default page, {}',
                            entry.pageTitle,
                            'do you want to detach this page and set default page to the 1st page in list?');
            }
            return format('Are you sure to detach the {} from page group {}?',
                            entry.pageTitle, this.pageGroup.title);
        }
        let msg = format('Are you sure to detach these following pages from page group {}?', this.pageGroup.title);
        msg += '<ul>';
        this.selectedPageEntries.forEach(element => {
            msg += '<li>';
            msg += element.pageTitle;
            if(element.isDefaultRelationship){
                msg += '/ Default page';
            }
            msg += '</li>';
        });
        msg += '</ul>';
        return msg;
    }

    getMsgDetackPageSuccess(entries:any[]){
        if(entries.length == 1){
            const entry = entries[0];
            this.selectedPageEntry = entry;
            return format('The page {} is successfully detached. {} and {}',
                            entry.pageTitle,
                            'Platform now will remove the relation between this page',
                            this.pageGroup.title
                        );
        }
        let msg = 'The following pages are successfully detached.';
        msg +=' Platform now will remove the relation between these pages and';
        msg += this.pageGroup.title;
        msg += '<ul>';
        this.selectedPageEntries.forEach(element => {
            msg += '<li>';
            msg += element.pageTitle;
            msg += '</li>';
        });
        msg += '</ul>';
        return msg;
    }

    removeRelationshipsFromPage(isSingle: boolean){
        let ids:any = [];
        if(isSingle){
            ids.push(this.selectedPageEntry.pageRelationshipId);
        }
        else{
            this.selectedPageEntries.forEach(element => {
                ids.push(element.pageRelationshipId);
            });
        }
        const haveDefault = this.listPagesInGroup.filter(x=>x.isDefaultRelationship).length > 0;
        this.pageGroupService.removePagesFromPageGroup(ids, this.pageGroup.entityId)
        .subscribe(result => {
            if (result) {
                let pagesArray = JSON.parse(result._body);
                //this.listPagesInGroup = pagesArray.map((p) => (this.mapPageInfoModel(p)));
                if(!isSingle){
                    this.confirmDetachPageSuccess.message = this.getMsgDetackPageSuccess(this.selectedPageEntries);
                    this.selectedPageEntries.forEach(y=>{
                        this.listPagesInGroup = this.listPagesInGroup.filter(x=>x.id != y.id);
                    });
                    this.selectedPageEntries = [];
                }
                else{
                    let entries = [];
                    entries.push(this.selectedPageEntry);
                    this.confirmDetachPageSuccess.message= this.getMsgDetackPageSuccess(entries);
                    this.listPagesInGroup = this.listPagesInGroup.filter(x=>x.id!=this.selectedPageEntry.id);
                }
                if(haveDefault && this.listPagesInGroup.length > 0 &&
                    this.listPagesInGroup.filter(x=>x.isDefaultRelationship).length <=0){
                    this.updateDefaultPage(this.listPagesInGroup[0]);
                }
                this.confirmDetachPageSuccess.show();
            }
        });
    }

    itemSelectChange(entry: any){
        if(entry.checked){
            this.selectedPageEntries.push(entry);
        }
        else{
            this.selectedPageEntries  = this.selectedPageEntries.filter(x=>x.id !=entry.id);
        }
    }

    mapPageInfoModel(pageEntity: any): PageInfoDetail {
        let pageInfo: PageInfoDetail = new PageInfoDetail();
        const page = pageEntity.page;
        pageInfo.id = page.entityId;
        pageInfo.pageTitle = page.data.info.internalUniquePageName;
        pageInfo.publishDate = page.publishedDate;
        pageInfo.site = 'MBC.net';
        pageInfo.status = page.status;
        pageInfo.type = page.type;
        pageInfo.subType = page.data.meta.pageSubType;

        let oldSelected = this.selectedPageEntries.filter(x=>x.id == page.entityId);
        if (oldSelected.length > 0) {
          pageInfo.checked = true;
        }

        const pageRelationship = pageEntity.pageRelationshipResponse;
        if (pageRelationship) {
          pageInfo.pageRelationshipId = pageRelationship.entityId;
          const props = pageRelationship.properties;
          if (props) {
            pageInfo.relationshipOrder = props.order;
            pageInfo.isDefaultRelationship = props.default;
          }
        }
        return pageInfo;
    };

    activate($event) {
        this.confirmPublishPopup.show([this.pageGroup.entityId]);
    }

    activatePageGroups(pageGroupIds: Array<string>) {
        this.pageGroupService.activatePageGroups(pageGroupIds).subscribe(result => {
            if(result && result.length) {
                let pg = result[0];
                this.pageGroup.groupStatus = pg.status;
                let options = {
                    currentStatus: this.pageGroup.groupStatus,
                    targetStatus: PAGE_GROUP_STATUS.LIVE
                };
                this.workflowService.getStatusInterval((variables) => {
                    this.pageGroup.groupStatus = variables.status;
                    this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                                        'Published'));
                }, CONTENT_TYPE.PAGE_GROUP, pageGroupIds[0], options);
            }
        });
    }


    /**
       * Confirm unpublish a page group
       * @param  the page group
       */
    confirmUnpublish($event) {
        this.confirmUnpublishPopup.show(this.pageGroup.entityId);
    }

     /**
     * Show popup confirm to delete the page group
     */
    confirmDelete($event){
        this.confirmDeletePopup.show(this.pageGroup.entityId);
    }

    /**
    * Invoke workflow unpublish a page group
    * @param  the page group
    */
    unpublishPageGroup(pageGroupId) {
        this.workflowService.unpublish(CONTENT_TYPE.PAGE_GROUP, pageGroupId)
            .subscribe(res => {
                this.pageGroup.groupStatus = res.status;
                let options = {
                    currentStatus: PAGE_GROUP_STATUS.UNPUBLISH,
                    targetStatus: PAGE_GROUP_STATUS.INACTIVE
                };

                this.workflowService.getStatusInterval((variables) => {
                    this.pageGroup.groupStatus = variables.status;
                    this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                            format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                                            'Un-published'));
                }, CONTENT_TYPE.PAGE_GROUP, pageGroupId, options);
            });
    }

    /**
    * Invoke workflow delete a page group
    * @param  the page group
    */
    onDelete(pageGroupId) {
      this.pageGroupService.deleteRelatives( [ pageGroupId ]).subscribe(delRes => {
        this.workflowService.delete(CONTENT_TYPE.PAGE_GROUP, pageGroupId)
          .subscribe(res => {
              this.pageGroup.groupStatus = res.status;
              let options = {
                  currentStatus: res.status,
                  targetStatus: PAGE_GROUP_STATUS.DELETED
              };

              this.workflowService.getStatusInterval((status) => {
                  this.router.navigate([`/page-groups`]).then(res => {
                    this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
                  });
              }, CONTENT_TYPE.PAGE_GROUP, pageGroupId, options);
          });
        })
    }
}
