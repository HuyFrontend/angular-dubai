import {
    Component, OnInit, Input, Output, OnChanges, SimpleChanges, ChangeDetectionStrategy, EventEmitter, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { PageActions, AlertsActions } from 'state';
import { FORM_STATE, NOTIFICATION_MESSAGE, PAGE_GROUP_STATUS, NOTIFICATION_TYPE, CONTENT_TYPE } from 'constant';
import { PageGroupData} from './page-groups.model';
import { LocalStorageService } from 'ngx-webstorage';
import { storageConfigs } from 'configs';
import { PageGroupService, ContentService, WorkflowService } from 'services';
import { PageInfoDetail } from './page-detail.model';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import * as format from 'string-format';
@Component({
    selector: 'group-create.component',
    templateUrl: 'group-create.component.html',
    styleUrls: ['group-create.component.scss']
})

export class GroupCreateComponent implements OnInit{
    public pageGroup: PageGroupData;
    public pageTypes: string[];
    public pageGroupForm: FormGroup;

    public isFormSubmitted:boolean = false;
    public isInfoValid: boolean = false;
    public sentOneRequest: boolean = false;
    public listPagesInGroup: Array<PageInfoDetail> = [];
    public message = NOTIFICATION_MESSAGE;
    public pageGroupStatus = PAGE_GROUP_STATUS;
    public originalValue: string = '';
    public action: string = 'Create';

    @ViewChild('confirmSaveAndPublishPopup') public confirmSaveAndPublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmClosePopup') public confirmClosePopup: MBCConfirmationComponent;


    constructor(
        private router: Router,
        private localStorageService: LocalStorageService,
        private pageGroupService: PageGroupService,
        private contentService: ContentService,
        private alertsActions: AlertsActions,
        private workflowService: WorkflowService
    ) {
        this.pageGroup = new PageGroupData();
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

    ngOnInit() {
      this.pageGroupForm = new FormGroup({
        type: new FormControl(this.pageGroup.type, [Validators.required]),
        title: new FormControl(this.pageGroup.title, [Validators.required], this.validateUniquePageGroup.bind(this)),
        followAllPages: new FormControl(this.pageGroup.followAllPages),
        instantPublishAllPages: new FormControl(this.pageGroup.instantPublishAllPages)
      });
    }

    validateUniquePageGroup(control: AbstractControl) {
      return new Promise(resolve => {
        this.contentService.checkExist('data.title', control.value).subscribe(res => {
          if (res.result) {
            resolve({asyncInvalid: true});
          } else {
            resolve(null);
          }
        });
      });
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

    confirmSaveAndPublish($event){
        this.confirmSaveAndPublishPopup.show();
    }

    onSaveAndPublish(){
        this.onSubmit(this.pageGroupForm.value, this.pageGroupForm.valid, true);
    }

    onSubmit(model: PageGroupData, isValid: boolean, isSaveAndPublish = false) {
      this.isFormSubmitted = true;
      if (isValid && !this.sentOneRequest) {
        this.sentOneRequest = true;
        const entity = {data: model}
        this.pageGroupService.save(entity).subscribe(x => {
          if(!model.entityId) {
            const { entityId } = x;
            if(isSaveAndPublish){
                this.activatePageGroups([entityId], isSaveAndPublish);
            }
            else{
                this.router.navigate([`/page-groups/detail/${entityId}`]);
            }
          } else {
            this.sentOneRequest = false;
          }
          if(!isSaveAndPublish){
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, 'Saved successfully');
          }
        }, error => this.sentOneRequest = false);
      }
    }

    activatePageGroups(pageGroupIds: Array<string>, isSaveAndPublish = false) {
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
                    if(isSaveAndPublish){
                        this.router.navigate([`/page-groups/detail/${pageGroupIds[0]}`]);
                    }
                }, CONTENT_TYPE.PAGE_GROUP, pageGroupIds[0], options);
            }
        });
    }

    removeRelationshipsFromPage(isSingle: boolean){
        // Do nothing. Cannot remove this method
    }

    updateDefaultPage(entry:any){
        // Do nothing. Cannot remove this method
    }

    unpublishPageGroup(pageGroupId) {
        // Do nothing. Cannot remove this method
    }

    onDelete(pageGroupId) {
        // Do nothing. Cannot remove this method
    }

}
