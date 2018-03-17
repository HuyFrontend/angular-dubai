import { AWARD_INPUT_FIELDS } from './../../../../core/constant/index';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AwardSubType } from 'models';
import { AppConfigService } from 'services';
import { storageConfigs, DEBOUNCE_TIME } from 'configs';
import { BUSINESS_INPUT_FIELDS, SUB_TYPES, PAGE_TYPE } from 'constant';
import { PageSubTypeService } from 'features/pages/page-subType.service';


@Component({
  selector: 'award-subtype',
  templateUrl: './award-subtype.component.html',
  styleUrls: ['./award-subtype.component.scss'],
  providers: [PageSubTypeService],
})
export class AwardSubTypeComponent implements OnInit, OnChanges {

  @Input() pageType: string;
  @Input() subType: string;
  @Input() subTypeText: string;
  @Input() subTypeData: AwardSubType;
  @Input() subTypeGroup: FormGroup;
  @Input() isFormSubmitted: boolean;

  public type: string = '';
  public needReInitFields: boolean = true;

  public inputFields: any = {

  };

  public defaultFields: string[] = [
    AWARD_INPUT_FIELDS.TITLE,
    AWARD_INPUT_FIELDS.ABOUT,
    AWARD_INPUT_FIELDS.CATEGORY,
  ];

  public listTitle: any[];
  public listFilmTitle: any[];
  public listMusicTitle: any[];
  public listSportTitle: any[];
  public listTelevisionTitle: any[];
  public listBeautyPageantTitle: any[];
  public listCategory: any[];

  constructor(
    private localStorageService: LocalStorageService,
    private pageSubTypeService: PageSubTypeService,
    private appConfigService: AppConfigService,
  ) {}

  ngOnInit() {
    const cachePageConfigs = this.localStorageService.retrieve(storageConfigs.page);
    this.pageSubTypeService.getDataFromCache('awardTitleFilm', cachePageConfigs).subscribe(data => {
      this.listFilmTitle = data;
      this.listTitle = this.listFilmTitle;
    });
    this.pageSubTypeService.getDataFromCache('awardTitleMusic', cachePageConfigs).subscribe(data => {
      this.listMusicTitle = data;
    });
    this.pageSubTypeService.getDataFromCache('awardTitleSport', cachePageConfigs).subscribe(data => {
      this.listSportTitle = data;
    });
    this.pageSubTypeService.getDataFromCache('awardTitleTelevision', cachePageConfigs).subscribe(data => {
      this.listTelevisionTitle = data;
    });
    this.pageSubTypeService.getDataFromCache('awardTitleBeautyPageant', cachePageConfigs).subscribe(data => {
      this.listBeautyPageantTitle = data;
    });
    this.pageSubTypeService.getDataFromCache('category', cachePageConfigs).subscribe(data => {
      this.listCategory = data;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.subTypeGroup && this.pageType === PAGE_TYPE.AWARD) {
      switch (this.subType) {
        case 'film':
          this.listTitle = this.listFilmTitle;
          break;

        case 'television':
          this.listTitle = this.listTelevisionTitle;
          break;

        case 'music':
          this.listTitle = this.listMusicTitle;
          break;

        case 'sport':
          this.listTitle = this.listSportTitle;
          break;

        case 'beautypageant':
          this.listTitle = this.listBeautyPageantTitle;
          break;
      }
    }
  }

  resetFields(): void {
    Object.keys(this.inputFields).forEach(key => this.inputFields[key] = false);
  }

  enableFields(arrFieldsToEnable: string[]): void {
    arrFieldsToEnable.map(field => this.inputFields[field] = true);
  }

  getEnableFieldsBasedOnType(type: string): string[] {
    let arrFieldsToEnable = [];

    // add default fields
    arrFieldsToEnable.push(...this.defaultFields);
    arrFieldsToEnable = arrFieldsToEnable.splice(1, 2);

    return arrFieldsToEnable;
  }

  saveCommonValues(pageSubTypeData: AwardSubType, preType: string, curType: string): AwardSubType {
    if (this.subTypeGroup) {
      pageSubTypeData = new AwardSubType();

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

  switchType(type: string, pageSubTypeData: AwardSubType, keepCommonValue: boolean = true): AwardSubType {
    this.resetFields();
    this.needReInitFields = true;
    this.enableFields(this.getEnableFieldsBasedOnType(type));
    if (keepCommonValue) {
      pageSubTypeData = this.saveCommonValues(pageSubTypeData, this.type, type);
    } else {
      pageSubTypeData = new AwardSubType();
    }

    this.type = type;

    return pageSubTypeData;
  }

  getSubTypeFormGroup(pageSubTypeData: AwardSubType): FormGroup {
    let subTypeFormGroup: FormGroup;
    subTypeFormGroup = new FormGroup({
      title: new FormControl(pageSubTypeData.title, [Validators.required]),
      about: new FormControl(pageSubTypeData.about, [Validators.required]),
      category: new FormControl(pageSubTypeData.category),
    });

    return subTypeFormGroup;
  }

  isValid(): boolean {
    return this.subTypeGroup.valid;
  }
}
