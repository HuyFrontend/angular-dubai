import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { EventsSubType } from 'models';
import { AppConfigService } from 'services';
import { storageConfigs, DEBOUNCE_TIME } from 'configs';
import { EVENTS_INPUT_FIELDS, SUB_TYPES, PAGE_TYPE } from 'constant';
import { PageSubTypeService } from 'features/pages/page-subType.service';


@Component({
  selector: 'events-subtype',
  templateUrl: './events-subtype.component.html',
  styleUrls: ['./events-subtype.component.scss'],
  providers: [PageSubTypeService],
})
export class EventsSubTypeComponent implements OnInit {

  @Input() pageType: string;
  @Input() subTypeText: string;
  @Input() subTypeData: EventsSubType;
  @Input() subTypeGroup: FormGroup;
  @Input() isFormSubmitted: boolean;

  public type: string = '';
  public needReInitFields: boolean = true;

  public inputFields: any = {
    aboutEvent: false,
    eventSeasonTitle: false,
    eventSeason: false,
    eventYear: false,
    startDate: false,
    time: false,
    country: false,
    city: false,
    venueName: false,
    venueSize: false,
    venueAddress: false,
    eventEmail: false,
    eventPhone: false,
    eventWebsite: false,
    smLink: false,
    //shahidId: false,
  };

  public defaultFields: string[] = [
    EVENTS_INPUT_FIELDS.EVENT_NAME,
    EVENTS_INPUT_FIELDS.LIVE_RECORDED,
  ];

  public listTime: any[] = [
    {code: 'gmt', names: [{locale: 'en', text: 'GMT'}]},
    {code: 'ksa', names: [{locale: 'en', text: 'KSA'}]},
    {code: 'clt', names: [{locale: 'en', text: 'CLT'}]},
  ];
  public listCountry: any[];
  public listCity: any[];

  constructor(
    private localStorageService: LocalStorageService,
    private appConfigService: AppConfigService,
    private pageSubTypeService: PageSubTypeService,
  ) {

  }

  ngOnInit() {
    const cachePageConfigs = this.localStorageService.retrieve(storageConfigs.page);
    this.pageSubTypeService.getDataFromCache('countries', cachePageConfigs).subscribe(data => {
      this.listCountry = data;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.subTypeGroup && this.pageType === PAGE_TYPE.EVENTS) {
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
    let arrFieldsToEnable = [EVENTS_INPUT_FIELDS.ABOUT_EVENT, EVENTS_INPUT_FIELDS.EVENT_SEASON_TITLE, EVENTS_INPUT_FIELDS.EVENT_SEASON,
                             EVENTS_INPUT_FIELDS.EVENT_YEAR, EVENTS_INPUT_FIELDS.LIVE_RECORDED, EVENTS_INPUT_FIELDS.START_DATE,
                             EVENTS_INPUT_FIELDS.END_DATE, EVENTS_INPUT_FIELDS.TIME, EVENTS_INPUT_FIELDS.COUNTRY,
                             EVENTS_INPUT_FIELDS.CITY, EVENTS_INPUT_FIELDS.VENUE_NAME, EVENTS_INPUT_FIELDS.VENUE_SIZE,
                             EVENTS_INPUT_FIELDS.VENUE_ADDRESS, EVENTS_INPUT_FIELDS.EVENT_EMAIL, EVENTS_INPUT_FIELDS.EVENT_PHONE,
                             EVENTS_INPUT_FIELDS.EVENT_WEBSITE, EVENTS_INPUT_FIELDS.SM_LINK];

    // add default fields
    arrFieldsToEnable.push(...this.defaultFields);

    return arrFieldsToEnable;
  }

  saveCommonValues(pageSubTypeData: EventsSubType, preType: string, curType: string): EventsSubType {
    if (this.subTypeGroup) {
      pageSubTypeData = new EventsSubType();

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

  switchType(type: string, pageSubTypeData: EventsSubType, keepCommonValue: boolean = true): EventsSubType {
    this.resetFields();
    this.needReInitFields = true;
    this.enableFields(this.getEnableFieldsBasedOnType(type));
    if (keepCommonValue) {
      pageSubTypeData = this.saveCommonValues(pageSubTypeData, this.type, type);
    } else {
      pageSubTypeData = new EventsSubType();
    }

    this.type = type;

    return pageSubTypeData;
  }

  getSubTypeFormGroup(pageSubTypeData: EventsSubType): FormGroup {
    let subTypeFormGroup: FormGroup = new FormGroup({
      eventName: new FormControl(pageSubTypeData.eventName, [Validators.required]),
      aboutEvent: new FormControl(pageSubTypeData.aboutEvent),
      eventSeasonTitle: new FormControl(pageSubTypeData.eventSeasonTitle),
      eventSeason: new FormControl(pageSubTypeData.eventSeason),
      eventYear: new FormControl(pageSubTypeData.eventYear),
      liveRecorded: new FormControl(pageSubTypeData.liveRecorded, [Validators.required]),
      startDate: new FormControl(pageSubTypeData.startDate),
      endDate: new FormControl(pageSubTypeData.endDate),
      time: new FormControl(pageSubTypeData.time),
      country: new FormControl(pageSubTypeData.country),
      city: new FormControl(pageSubTypeData.city),
      venueName: new FormControl(pageSubTypeData.venueName),
      venueSize: new FormControl(pageSubTypeData.venueSize),
      venueAddress: new FormControl(pageSubTypeData.venueAddress),
      eventEmail: new FormControl(pageSubTypeData.eventEmail),
      eventPhone: new FormControl(pageSubTypeData.eventPhone),
      eventWebsite: new FormControl(pageSubTypeData.eventWebsite),
      smLink: new FormControl(pageSubTypeData.smLink),
      //shahidId: new FormControl(pageSubTypeData.shahidId),
    });

    return subTypeFormGroup;
  }

  isValid(): boolean {
    return this.subTypeGroup.valid;
  }
}
