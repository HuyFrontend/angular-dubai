import { PageTabInfoComponent } from '../pageTabInfo';
import {
    Component, OnInit, Input, Output, OnChanges,
    SimpleChanges, ChangeDetectionStrategy, EventEmitter,
    ViewChild, OnDestroy

} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { PageActions, AlertsActions } from 'state';
import { PageModel, PageInfo, PageMeta, PageSetting, ProfileSubType, ShowSubType, InfoComponent } from 'models';
import { FORM_STATE, PAGE_STATUS, NOTIFICATION_TYPE, NOTIFICATION_MESSAGE, CONTENT_TYPE } from 'constant';
import { WorkflowService } from 'services';
import isEqual from 'lodash/isEqual';
import * as format from 'string-format';

import { PageTabMetadataComponent } from '../../components/pageTabMetadata';
import { PageTabInfoComponentsComponent } from '../../components/pageTabInfoComponents';

@Component({
    selector: 'page-form',
    templateUrl: 'page-form.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['page-form.scss']
})

export class PageFormComponent implements OnInit, OnChanges, OnDestroy {
    constructor(private router: Router,
                private pageActions: PageActions,
                private workflowService: WorkflowService,
                private alertsActions: AlertsActions)
                {}
    @Input() pageModel: PageModel;
    @Input() copyFromId: string;

    @ViewChild('pageTabMetadataComponent') public pageTabMetadataComponent: PageTabMetadataComponent;
    @ViewChild('pageTabInfocomponents') public pageTabInfocomponents: PageTabInfoComponentsComponent;

    public isInfoTabChanged: boolean = false;
    public isSettingTabChanged: boolean = false;
    public isMetaTabChanged: boolean = false;
    public isInfoComponentTabChanged: boolean = false;
    public isFormSubmitted: boolean = false;
    public sentOneRequest: boolean = false;
    public pageChanged = new PageModel();

    public isInfoValid: boolean = false;
    public isMetaValid: boolean = false;
    public isSettingsValid: boolean = false;
    public pageStatus: any = {
      info: '',
      meta: '',
      settings: ''
    };

    ngOnInit() {
        if (this.copyFromId) {
            this.isInfoValid = true;
            this.isInfoTabChanged = true;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
      const model = changes.pageModel.currentValue as PageModel;
      this.pageChanged = {
          ...model
      };

      if (this.pageChanged.entityId) {
          this.isInfoValid = true;
      }
    }

    ngOnDestroy() {
        this.pageActions.resetForm();
    }

    onStatusChanged($status){
        this.pageModel.status = $status;
    }


    infoStatusChanged(infoForm: any) : void {
      this.pageStatus.info = infoForm.status;
      this.isInfoValid = infoForm.status === FORM_STATE.VALID;
    }

    metaStatusChanged(metaForm: any): void {
      this.pageStatus.meta = metaForm.status;
      this.isMetaValid = metaForm.status === FORM_STATE.VALID;
    }

    settingsStatusChanged(settingsForm: any): void {
      this.pageStatus.settings = settingsForm.status;
      this.isSettingsValid = settingsForm.status === FORM_STATE.VALID;
    }

    infoValueChanged(info: any) : void {
      this.pageModel.info.coverThumbnail = null;
      this.pageModel.info.logoThumbnail = null;
      this.pageModel.info.posterThumbnail = null;

      this.isInfoTabChanged = this.copyFromId != undefined || !this.isEquals(info, this.pageModel.info);
      const pageType: string = info.type;
      if (!this.pageModel.meta.pageSubTypeData) {
        this.switchType(this.pageModel.meta, pageType);
      }
      //this.pageModel.meta.switchType(pageType);
      this.pageChanged = {
        ...this.pageChanged,
        info
      }
    }

    switchType(meta: PageMeta, type: string) {
      if (type === 'profile') {
        meta.pageSubTypeData = new ProfileSubType();
      } else {
        meta.pageSubTypeData = new ShowSubType();
      }

    }

    settingsChanged(settings: PageSetting) {
        this.isSettingTabChanged = !this.isEquals(settings, this.pageModel.settings);
        this.pageChanged = {
            ...this.pageChanged,
            settings
        };
    }

    metaChanged(meta: PageMeta) {
      this.isMetaTabChanged = !this.isEquals(meta, this.pageModel.meta);
      this.pageChanged = {
          ...this.pageChanged,
          meta
      };
    }

    infoComponentsChanged(infoComponents: InfoComponent[]) {
      console.log('isInfoComponentTabChanged');
      this.isInfoComponentTabChanged = !this.isEquals(infoComponents, this.pageModel.infoComponents);
      this.pageChanged = {
          ...this.pageChanged,
          infoComponents
      };
    }

    isEquals(o1, o2) {
      if(!o1 && !o2) return true;
      if(!o1 || !o2) return false;

      const v1 = this.removeNullProps(o1);
      const v2 = this.removeNullProps(o2);
      return isEqual(v1, v2);
    }

    removeNullProps(o) {
      const cloned = Object.assign({...o});
      const keys = Object.keys(cloned);
      keys.forEach(key => {
        if(!cloned[key]) {
          delete cloned[key];
        }
      });
      return cloned;
    }

    onSaveAndPublish(){
      this.onSubmit(true);
    }

    onSubmit(isSaveAndPublish= false) {
      this.isFormSubmitted = true;
      if (this.pageTabMetadataComponent.isValid()
        && this.isPageTabInfoComponentValid()
        && this.isInfoValid && !this.sentOneRequest) {
        this.sentOneRequest = true;
        this.pageChanged.info.internalUniquePageName = this.pageChanged.info.internalUniquePageName.trim();
        this.pageActions.savePage(this.pageChanged, !isSaveAndPublish).subscribe(x => {
          this.isFormSubmitted = false;
          this.isInfoTabChanged = this.isSettingTabChanged = this.isMetaTabChanged = this.isInfoComponentTabChanged = false;
          if(isSaveAndPublish){
            const entityId = this.pageModel && this.pageModel.entityId ? this.pageModel.entityId : x.entityId;
            this.onPublishAfterSaving(entityId);
          }
          if (!this.pageChanged.entityId && !isSaveAndPublish) {
              const { entityId } = x;
              this.router.navigate([`/pages/detail/${entityId}`]);
          } else {
            this.sentOneRequest = false;
          }
        }, error => this.sentOneRequest = false);
      }
    }

    private isPageTabInfoComponentValid(){
      return !this.pageTabInfocomponents || (this.pageTabInfocomponents && this.pageTabInfocomponents.isValid());
    }

    onPublishAfterSaving(entityId:string) {
      this.pageActions.publishPage(entityId)
          .subscribe(x=> {
              let options = {
                  currentStatus: this.pageStatus,
                  targetStatus: PAGE_STATUS.LIVE
              };

              this.workflowService.getStatusInterval((variables) => {
                  this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                          format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                                          'Published'));
                  this.router.navigate([`/pages/detail/${entityId}`]);
              }, CONTENT_TYPE.PAGE, entityId, options);
          });
  }

    isFormChanged () {
       return this.isInfoTabChanged || this.isSettingTabChanged || this.isMetaTabChanged || this.isInfoComponentTabChanged;
    }
}
