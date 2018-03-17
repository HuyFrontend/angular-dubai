import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { BusinessSubType } from 'models';
import { AppConfigService } from 'services';
import { storageConfigs, DEBOUNCE_TIME } from 'configs';
import { BUSINESS_INPUT_FIELDS, SUB_TYPES, PAGE_TYPE } from 'constant';
import { PageSubTypeService } from 'features/pages/page-subType.service';


@Component({
  selector: 'business-subtype',
  templateUrl: './business-subtype.component.html',
  styleUrls: ['./business-subtype.component.scss'],
  providers: [PageSubTypeService],
})
export class BusinessSubTypeComponent implements OnInit {

  @Input() pageType: string;
  @Input() subTypeText: string;
  @Input() subTypeData: BusinessSubType;
  @Input() subTypeGroup: FormGroup;
  @Input() isFormSubmitted: boolean;

  public type: string = '';
  public needReInitFields: boolean = true;

  public inputFields: any = {

  };

  public defaultFields: string[] = [
    BUSINESS_INPUT_FIELDS.NAME,
    BUSINESS_INPUT_FIELDS.FOUNDED,
    BUSINESS_INPUT_FIELDS.COUNTRY,
    BUSINESS_INPUT_FIELDS.CITY,
    BUSINESS_INPUT_FIELDS.INDUSTRY,
    BUSINESS_INPUT_FIELDS.SUB_INDUSTRY,
    BUSINESS_INPUT_FIELDS.SOCIAL_NETWORK,
    BUSINESS_INPUT_FIELDS.COMPANY_WEBSITE,
    BUSINESS_INPUT_FIELDS.HQ_COUNTRY,
    BUSINESS_INPUT_FIELDS.ABOUT,
  ];

  public listIndustry: any[];
  public listSubIndustry: any[];
  public listHQCountry: any[];
  public listCountry: any[];
  public listCity: any[];

  constructor(
    private localStorageService: LocalStorageService,
    private pageSubTypeService: PageSubTypeService,
    private appConfigService: AppConfigService,
  ) {}

  ngOnInit() {
    const cachePageConfigs = this.localStorageService.retrieve(storageConfigs.page);
    this.pageSubTypeService.getDataFromCache('industries', cachePageConfigs).subscribe(data => {
      this.listIndustry = data;
    });
    this.pageSubTypeService.getDataFromCache('subindustries', cachePageConfigs).subscribe(data => {
      this.listSubIndustry = data;
    });
    this.pageSubTypeService.getDataFromCache('countries', cachePageConfigs).subscribe(data => {
      this.listCountry = data;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.subTypeGroup && this.pageType === PAGE_TYPE.BUSINESS) {
      const country = this.subTypeGroup.controls.country;
      country.valueChanges.subscribe(countryCode => {
        this.listCity = [];
        if (country.value && country.value !== this.subTypeData.country) {
          if (this.subTypeGroup.controls.city) {
            this.subTypeGroup.controls.city.setValue('');
            this.fetchAndBindCity(countryCode);
          }
          this.subTypeData.country = country.value;
        };
      });
      if (country.value) {
        this.fetchAndBindCity(country.value);
      }
    }
  }

  fetchAndBindCity(country: string) {
    this.appConfigService.fetchCitiesByCountryCode(country)
      .subscribe(cities => {
        const country = this.subTypeGroup.controls.country.value;
        this.listCity = cities[country];
      });
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

    return arrFieldsToEnable;
  }

  saveCommonValues(pageSubTypeData: BusinessSubType, preType: string, curType: string): BusinessSubType {
    if (this.subTypeGroup) {
      pageSubTypeData = new BusinessSubType();

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

  switchType(type: string, pageSubTypeData: BusinessSubType, keepCommonValue: boolean = true): BusinessSubType {
    this.resetFields();
    this.needReInitFields = true;
    this.enableFields(this.getEnableFieldsBasedOnType(type));
    if (keepCommonValue) {
      pageSubTypeData = this.saveCommonValues(pageSubTypeData, this.type, type);
    } else {
      pageSubTypeData = new BusinessSubType();
    }

    this.type = type;

    return pageSubTypeData;
  }

  getSubTypeFormGroup(pageSubTypeData: BusinessSubType): FormGroup {
    let subTypeFormGroup: FormGroup;
    subTypeFormGroup = new FormGroup({
      name: new FormControl(pageSubTypeData.name, [Validators.required]),
      founded: new FormControl(pageSubTypeData.founded, [Validators.required]),
      country: new FormControl(pageSubTypeData.country, [Validators.required]),
      city: new FormControl(pageSubTypeData.city, [Validators.required]),
      industry: new FormControl(pageSubTypeData.industry, [Validators.required]),
      subIndustry: new FormControl(pageSubTypeData.subIndustry, [Validators.required]),
      hqCountry: new FormControl(pageSubTypeData.hqCountry, [Validators.required]),
      about: new FormControl(pageSubTypeData.about, [Validators.required]),
      socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
      companyWebsite: new FormControl(pageSubTypeData.companyWebsite),
    });

    return subTypeFormGroup;
  }

  isValid(): boolean {
    console.log(this.subTypeGroup);
    return this.subTypeGroup.valid;
  }
}
