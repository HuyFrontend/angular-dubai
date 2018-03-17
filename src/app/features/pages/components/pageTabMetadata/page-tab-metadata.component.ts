import { SectionSubTypeComponent } from './../sectionSubType/section-subtype.component';
import {
    Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter, ChangeDetectionStrategy, ViewChild, ViewEncapsulation, ElementRef
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';

import { PageMeta, ProfileSubType } from 'models';
import { getHoroscopeName } from 'utils';
import { storageConfigs } from 'configs';
import { FORM_STATE, PAGE_STATUS } from 'constant';
import { PageTypeService } from 'features/pages/page-type.service';
import { ChannelSubTypeComponent } from './../channelSubType';
import { ShowSubTypeComponent } from './../showSubType';
import { EventsSubTypeComponent } from './../eventsSubType';
import { ProfileSubTypeComponent } from './../profileSubType';
import { BusinessSubTypeComponent } from './../businessSubType';
import { AwardSubTypeComponent } from './../awardSubType';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';

import { ISubType } from 'state/app-interfaces';

@Component({
    selector: 'page-tab-metadata',
    styleUrls: ['page-tab-metadata.scss'],
    templateUrl: 'page-tab-metadata.html',
    providers: [PageTypeService],
    encapsulation: ViewEncapsulation.None,
})

export class PageTabMetadataComponent implements OnInit, OnChanges {

    // TODO: Have to refactor structure of page subTypes next sprint
    public pageSubTypes: string[];

    @ViewChild('profileSubType') public profileSubTypeComponent: ProfileSubTypeComponent;
    @ViewChild('showSubType') public showSubTypeComponent: ShowSubTypeComponent;
    @ViewChild('channelSubType') public channelSubTypeComponent: ChannelSubTypeComponent;
    @ViewChild('eventsSubType') public eventsSubTypeComponent: EventsSubTypeComponent;
    @ViewChild('sectionSubType') public sectionSubTypeComponent: SectionSubTypeComponent;
    @ViewChild('businessSubType') public businessSubTypeComponent: BusinessSubTypeComponent;
    @ViewChild('awardSubType') public awardSubTypeComponent: AwardSubTypeComponent;
    @ViewChild('mbcConfirm') public mbcConfirmComponent: MBCConfirmationComponent;
    @ViewChild('subTypeSelect') public subTypeSelect: ElementRef;

    @Input() isFormSubmitted: boolean;
    @Input() meta: PageMeta;
    @Input() pageType: string;
    @Input() pageTypeName: string[];
    @Input() pageEntityId: string;
    @Input() pageStatus: string;

    @Output() statusChanged = new EventEmitter<any>();
    @Output() modelChanged = new EventEmitter<PageMeta>();

    public pageSubTypeComponent: ISubType;
    public metaGroup: FormGroup;
    public subTypeGroup: FormGroup;
    public pageSubTypeData: ProfileSubType;
    public subTypeText: string;

    public oldSubType: string;
    public curSubType: string;

    constructor(private localStorageService: LocalStorageService, private pageTypeService: PageTypeService) { }

    /**
     * Init FormGroup for meta tab
     *
     * @param {PageMeta} meta
     * @returns
     *
     * @memberOf PageFormComponent
     */
    initialFormGroup(): void {
      let isFirstInit: boolean = true;

      this.metaGroup = new FormGroup({
        pageSubType: new FormControl(this.meta.pageSubType, [Validators.required])
      });
      this.metaGroup.statusChanges
        .subscribe(status => {
          this.statusChanged.emit({ status });
        });

      this.metaGroup.controls.pageSubType.valueChanges.do(value => {
        let oldValue = this.metaGroup.value['pageSubType'];
        if (value) {
          this.getSubTypeText(value);

          this.curSubType = value;
          if (oldValue && oldValue !== value) {
            this.oldSubType = oldValue;
            this.mbcConfirmComponent.show();
          } else {
            this.pageSubTypeData = this.meta.pageSubTypeData;
            if (this.pageSubTypeData === null) {
              this.pageSubTypeData = new ProfileSubType();
            }

            if (isFirstInit || oldValue === value) {
              isFirstInit = false;
              this.pageSubTypeData = this.pageSubTypeComponent.switchType(this.curSubType, this.pageSubTypeData, true);
            } else {
              this.pageSubTypeData = this.pageSubTypeComponent.switchType(this.curSubType, this.pageSubTypeData, false);
            }
            this.subTypeGroup = this.pageSubTypeComponent.getSubTypeFormGroup(this.pageSubTypeData);
            this.metaGroup.removeControl('pageSubTypeData');
            this.metaGroup.addControl('pageSubTypeData', this.subTypeGroup);
          }
        } else {
          this.metaGroup.removeControl('pageSubTypeData');
        }
      }).subscribe();

      this.metaGroup.valueChanges.subscribe(x => {
        this.modelChanged.emit(this.metaGroup.getRawValue());
      });
    }

    getSubTypeText(subTypeValue: string): void {
      let subTypeOpts = this.subTypeSelect.nativeElement.options,
            textObject: any = null;
      if (subTypeOpts.selectedIndex && subTypeOpts[subTypeOpts.selectedIndex]) {
        this.subTypeText = subTypeOpts[subTypeOpts.selectedIndex].text;
      } else {
        this.pageSubTypes.map(subType => {
          if (subType['code'] === subTypeValue) {
            textObject = subType['names'][0];
            this.subTypeText = textObject.text;
          }
        });
      }
    }

    onClickConfirmPopupYes(event): void {
      this.pageSubTypeData = this.meta.pageSubTypeData;
      if (this.pageSubTypeData === null) {
        this.pageSubTypeData = new ProfileSubType();
      }

      this.pageSubTypeData = this.pageSubTypeComponent.switchType(this.curSubType, this.pageSubTypeData, true);
      this.subTypeGroup = this.pageSubTypeComponent.getSubTypeFormGroup(this.pageSubTypeData);
      this.metaGroup.removeControl('pageSubTypeData');
      this.metaGroup.addControl('pageSubTypeData', this.subTypeGroup);
    }

    onClickConfirmPopupNo(event): void {
      this.pageSubTypeData = this.meta.pageSubTypeData;
      if (this.pageSubTypeData === null) {
        this.pageSubTypeData = new ProfileSubType();
      }

      this.pageSubTypeData = this.pageSubTypeComponent.switchType(this.curSubType, this.pageSubTypeData, false);
      this.subTypeGroup = this.pageSubTypeComponent.getSubTypeFormGroup(this.pageSubTypeData);
      this.metaGroup.removeControl('pageSubTypeData');
      this.metaGroup.addControl('pageSubTypeData', this.subTypeGroup);
    }

    onClickConfirmPopupCancel(event): void {
      this.metaGroup.controls.pageSubType.setValue(this.oldSubType);
    }

    isValid() {
      if (this.subTypeGroup) {
        return this.pageSubTypeComponent.isValid();
      }

      const status = this.metaGroup.status;
      this.statusChanged.emit({ status });
      return false;
    }

    ngOnInit() {

    }

    bindStateToForm(): void {
      if (!this.metaGroup) {
        this.initialFormGroup();
        return;
      }
      if (!this.isFormSubmitted) {
        const { controls: formControls } = this.metaGroup;
        Object.keys(formControls).map((key, idx, arr) => {
          const model = this.meta;
          if (model[key] && formControls[key]) {
            formControls[key].setValue(model[key]);
          }
        });
      }
    }

    setPageSubTypeState() {
      if (!this.pageStatus || this.pageStatus === PAGE_STATUS.DRAFT) {
        this.metaGroup.controls['pageSubType'].enable();
      } else {
        this.metaGroup.controls['pageSubType'].disable();
      }
    }

    ngOnChanges(changes: SimpleChanges) {
      const pageConfigs = this.localStorageService.retrieve(storageConfigs.page);

      if (changes.pageType) {
        const typeValue: string = changes.pageType.currentValue;
        this.pageSubTypeData = this.meta.pageSubTypeData;
        if (changes.pageType.previousValue && this.metaGroup && this.metaGroup.controls.pageSubType) {
          this.metaGroup.controls.pageSubType.reset();
          this.metaGroup.controls.pageSubType.setValue('');
          this.meta.pageSubType = '';
        }

        // TODO: remove saved value on curSubtype in dropdown and remove the subtype form group control if there's one
        if (typeValue === 'profile') {
          this.pageSubTypeComponent = this.profileSubTypeComponent;
        } else if (typeValue === 'show') {
          this.pageSubTypeComponent = this.showSubTypeComponent;
        } else if (typeValue === 'channel') {
          this.pageSubTypeComponent = this.channelSubTypeComponent;
        } else if (typeValue === 'events') {
          this.pageSubTypeComponent = this.eventsSubTypeComponent;
        } else if (typeValue === 'business') {
          this.pageSubTypeComponent = this.businessSubTypeComponent;
        } else if (typeValue === 'award') {
          this.pageSubTypeComponent = this.awardSubTypeComponent;
        } else {
          this.pageSubTypeComponent = this.sectionSubTypeComponent;
        }
        this.pageTypeName = this.pageTypeService.getPageTypeName(typeValue);
        this.pageTypeService.getSubTypeList(typeValue, pageConfigs).subscribe(data => {
          this.pageSubTypes = data;
          if (typeValue === 'section') {
            this.metaGroup.controls.pageSubType.setValue(this.pageSubTypes[0]['code']);
          } else if (this.pageSubTypes && this.pageSubTypes.length === 0) {
            this.metaGroup.controls.pageSubType.setValue('');
          }

        });
      }

      // TODO: Have to refactor
      this.bindStateToForm();

      //if (changes.pageStatus) {
        //this.setPageSubTypeState();
      //}
    }

    shouldBeDisabled() {
      if (this.pageType === 'section' || (this.pageStatus && this.pageStatus !== PAGE_STATUS.DRAFT)) {
        return true;
      }

      return null;
    }
}
