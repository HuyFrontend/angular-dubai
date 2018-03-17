import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { SectionSubType } from 'models';
import { storageConfigs, DEBOUNCE_TIME } from 'configs';
import { SECTION_INPUT_FIELDS, SUB_TYPES, PAGE_TYPE } from 'constant';
import { PageSubTypeService } from 'features/pages/page-subType.service';


@Component({
  selector: 'section-subtype',
  templateUrl: './section-subtype.component.html',
  styleUrls: ['./section-subtype.component.scss'],
  providers: [PageSubTypeService],
})
export class SectionSubTypeComponent implements OnInit {

  @Input() pageType: string;
  @Input() subTypeText: string;
  @Input() subTypeData: SectionSubType;
  @Input() subTypeGroup: FormGroup;
  @Input() isFormSubmitted: boolean;

  public type: string = '';
  public needReInitFields: boolean = true;

  public inputFields: any = {

  };

  public defaultFields: string[] = [
    SECTION_INPUT_FIELDS.TITLE,
    SECTION_INPUT_FIELDS.EMAIL,
    SECTION_INPUT_FIELDS.WEBSITE,
    SECTION_INPUT_FIELDS.ABOUT,
    SECTION_INPUT_FIELDS.SOCIAL_NETWORK,
  ];

  constructor() {}

  ngOnInit() {

  }

  resetFields(): void {
    Object.keys(this.inputFields).forEach(key => this.inputFields[key] = false);
  }

  enableFields(arrFieldsToEnable: string[]): void {
    arrFieldsToEnable.map(field => this.inputFields[field] = true);
  }

  getEnableFieldsBasedOnType(type: string): string[] {
    let arrFieldsToEnable = [];

    if (type === SUB_TYPES.TV_CHANNEL) {
      arrFieldsToEnable = [];
    } else if (type === SUB_TYPES.RADIO_CHANNEL) {
      arrFieldsToEnable = [];
    }

    // add default fields
    arrFieldsToEnable.push(...this.defaultFields);

    return arrFieldsToEnable;
  }

  saveCommonValues(pageSubTypeData: SectionSubType, preType: string, curType: string): SectionSubType {
    if (this.subTypeGroup) {
      pageSubTypeData = new SectionSubType();

      const preFields = this.getEnableFieldsBasedOnType(preType),
            curFields = this.getEnableFieldsBasedOnType(curType);

      curFields.map(field => {
        if (preFields.indexOf(field) !== -1) {
          pageSubTypeData[field] = this.subTypeGroup.controls[field].value;
        }
      });
    }

    return pageSubTypeData;
  }

  switchType(type: string, pageSubTypeData: SectionSubType, keepCommonValue: boolean = true): SectionSubType {
    this.resetFields();
    this.needReInitFields = true;
    this.enableFields(this.getEnableFieldsBasedOnType(type));
    if (keepCommonValue) {
      pageSubTypeData = this.saveCommonValues(pageSubTypeData, this.type, type);
    } else {
      pageSubTypeData = new SectionSubType();
    }

    this.type = type;

    return pageSubTypeData;
  }

  getSubTypeFormGroup(pageSubTypeData: SectionSubType): FormGroup {
    let subTypeFormGroup: FormGroup;
    subTypeFormGroup = new FormGroup({
      title: new FormControl(pageSubTypeData.title, [Validators.required]),
      email: new FormControl(pageSubTypeData.email),
      website: new FormControl(pageSubTypeData.website),
      about: new FormControl(pageSubTypeData.about, [Validators.required]),
      socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
    });

    return subTypeFormGroup;
  }

  isValid(): boolean {
    return this.subTypeGroup.valid;
  }
}
