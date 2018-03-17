import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ChannelSubType } from 'models';
import { storageConfigs, DEBOUNCE_TIME } from 'configs';
import { CHANNEL_INPUT_FIELDS, SUB_TYPES, PAGE_TYPE } from 'constant';
import { PageSubTypeService } from 'features/pages/page-subType.service';


@Component({
  selector: 'channel-subtype',
  templateUrl: './channel-subtype.component.html',
  styleUrls: ['./channel-subtype.component.scss'],
  providers: [PageSubTypeService],
})
export class ChannelSubTypeComponent implements OnInit {

  @Input() pageType: string;
  @Input() subTypeText: string;
  @Input() subTypeData: ChannelSubType;
  @Input() subTypeGroup: FormGroup;
  @Input() isFormSubmitted: boolean;

  public type: string = '';
  public needReInitFields: boolean = true;

  public inputFields: any = {

  };

  public defaultFields: string[] = [
    CHANNEL_INPUT_FIELDS.CHANNEL_NAME,
    CHANNEL_INPUT_FIELDS.CHANNEL_SHORT_NAME,
    CHANNEL_INPUT_FIELDS.REGION_LIST,
    CHANNEL_INPUT_FIELDS.TIMEZONE_LIST,
    CHANNEL_INPUT_FIELDS.LANGUAGE,
    CHANNEL_INPUT_FIELDS.ABOUT,
    CHANNEL_INPUT_FIELDS.CHANNEL_FREQUENCY,
    CHANNEL_INPUT_FIELDS.GENRE,
    CHANNEL_INPUT_FIELDS.SOCIAL_NETWORK,
    CHANNEL_INPUT_FIELDS.RADIO_SCRIPT,
  ];

  public listLanguage: any[] = [
    {code: 'ar', names: [{locale: "en", text: "Arabic"}]},
    {code: 'en', names: [{locale: "en", text: "English"}]},
  ];
  public listTimezone: any[] = [
    {code: 'gmt', names: [{locale: "en", text: "GMT"}]},
    {code: 'ksa', names: [{locale: "en", text: "KSA"}]},
    {code: 'clt', names: [{locale: "en", text: "CLT"}]},
  ];

  public listRegion: any[];
  public listGenre: any[];

  constructor(
    private localStorageService: LocalStorageService,
    private pageSubTypeService: PageSubTypeService,
  ) {

  }

  ngOnInit() {
    const cachePageConfigs = this.localStorageService.retrieve(storageConfigs.page);
    this.pageSubTypeService.getDataFromCache('regions', cachePageConfigs).subscribe(data => {
      this.listRegion = data;
    });

    this.pageSubTypeService.getDataFromCache('genres', cachePageConfigs).subscribe(data => {
      this.listGenre = data;
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.subTypeGroup && this.pageType === PAGE_TYPE.CHANNEL) {
      const genre = this.subTypeGroup.controls.genre;
      if (genre) {
        genre.valueChanges.subscribe(x => {
          if (genre.value && genre.value !== this.subTypeData.genre) {
            this.subTypeData.genre = genre.value;
          };
        });
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

    if (type === SUB_TYPES.TV_CHANNEL) {
      arrFieldsToEnable = [];
    } else if (type === SUB_TYPES.RADIO_CHANNEL) {
      arrFieldsToEnable = [];
    }

    // add default fields
    arrFieldsToEnable.push(...this.defaultFields);

    return arrFieldsToEnable;
  }

  saveCommonValues(pageSubTypeData: ChannelSubType, preType: string, curType: string): ChannelSubType {
    if (this.subTypeGroup) {
      pageSubTypeData = new ChannelSubType();

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

  switchType(type: string, pageSubTypeData: ChannelSubType, keepCommonValue: boolean = true): ChannelSubType {
    this.resetFields();
    this.needReInitFields = true;
    this.enableFields(this.getEnableFieldsBasedOnType(type));
    if (keepCommonValue) {
      pageSubTypeData = this.saveCommonValues(pageSubTypeData, this.type, type);
    } else {
      pageSubTypeData = new ChannelSubType();
    }

    this.type = type;

    return pageSubTypeData;
  }

  getSubTypeFormGroup(pageSubTypeData: ChannelSubType): FormGroup {
    let subTypeFormGroup: FormGroup;
    subTypeFormGroup = new FormGroup({
      channelName: new FormControl(pageSubTypeData.channelName, [Validators.required]),
      channelShortName: new FormControl(pageSubTypeData.channelShortName, [Validators.required]),
      regionList: new FormControl(pageSubTypeData.regionList, [Validators.required]),
      timezoneList: new FormControl(pageSubTypeData.timezoneList, [Validators.required]),
      language: new FormControl(pageSubTypeData.language, [Validators.required]),
      about: new FormControl(pageSubTypeData.about, [Validators.required]),
      channelFrequency: new FormControl(pageSubTypeData.channelFrequency, [Validators.required]),
      genre: new FormControl(pageSubTypeData.genre, [Validators.required]),
      socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
      radioScript: new FormControl(pageSubTypeData.radioScript, [Validators.required]),
    });

    return subTypeFormGroup;
  }

  isValid(): boolean {
    return this.subTypeGroup.valid;
  }
}
