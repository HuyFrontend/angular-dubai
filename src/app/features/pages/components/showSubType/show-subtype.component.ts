import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ShowSubType } from 'models';
import { AppConfigService } from 'services';
import { storageConfigs, DEBOUNCE_TIME } from 'configs';
import { SHOW_INPUT_FIELDS, SUB_TYPES, PAGE_TYPE } from 'constant';
import { PageSubTypeService } from 'features/pages/page-subType.service';

import { getHoroscopeName } from 'utils';

@Component({
  selector: 'show-subtype',
  templateUrl: './show-subtype.component.html',
  styleUrls: ['./show-subtype.component.scss'],
  providers: [PageSubTypeService],
})
export class ShowSubTypeComponent implements OnInit {

  @Input() pageType: string;
  @Input() subTypeText: string;
  @Input() subTypeData: ShowSubType;
  @Input() subTypeGroup: FormGroup;
  @Input() isFormSubmitted: boolean;

  public type: string = '';
  public needReInitFields: boolean = true;
  public isLoadingCityList: boolean = false;

  public inputFields: any = {
    showLanguage: false,
    dialect: false,
    genre: false,
    subGenre: false,
    censorshipClass: false,
    subtitlingDubbing: false,
    city: false,
    stadiumName: false,
    stadiumGPS: false,
    liveRecorded: false,
    yearDebuted: false,
    seasonNumber: false,
    sequelNumber: false,
    expectedReleaseDate: false,
  };

  public defaultFields: string[] = [
    SHOW_INPUT_FIELDS.ARABIC_TITLE,
    SHOW_INPUT_FIELDS.ENGLISH_TITLE,
    SHOW_INPUT_FIELDS.ABOUT,
    SHOW_INPUT_FIELDS.COUNTRY,
    SHOW_INPUT_FIELDS.SOCIAL_NETWORK,
    SHOW_INPUT_FIELDS.BCM_ID,
    SHOW_INPUT_FIELDS.SHAHID_ID,
  ];

  public listShowLanguage: any[] = [];
  public listDialect: any[] = [];
  public listCensorshipClass: any[] = [];
  public listSubtitlingDubbing: any[] = [];
  public listGenre: any[];
  public listSubGenre: any[] = [];
  public listSubGenreSelected: any[] = [];
  public listCountry: any[];
  public listCity: any[];

  constructor(
    private localStorageService: LocalStorageService,
    private appConfigService: AppConfigService,
    private pageSubTypeService: PageSubTypeService,
    private _sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
  ) {

  }

  ngOnInit() {
    const cachePageConfigs = this.localStorageService.retrieve(storageConfigs.page);
    this.pageSubTypeService.getDataFromCache('countries', cachePageConfigs).subscribe(data => {
      this.listCountry = data;
    });
    this.pageSubTypeService.getDataFromCache('genres', cachePageConfigs).subscribe(data => {
      this.listGenre = data;
    });
    this.pageSubTypeService.getDataFromCache('originalLanguages', cachePageConfigs).subscribe(data => {
      this.listShowLanguage = data;
    });
    this.pageSubTypeService.getDataFromCache('dialects', cachePageConfigs).subscribe(data => {
      this.listDialect = data;
    });
    this.pageSubTypeService.getDataFromCache('censorshipClasses', cachePageConfigs).subscribe(data => {
      this.listCensorshipClass = data;
    });
    this.pageSubTypeService.getDataFromCache('subtitlingAndDubbing', cachePageConfigs).subscribe(data => {
      this.listSubtitlingDubbing = data;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.subTypeGroup && this.pageType === PAGE_TYPE.SHOW) {
      const genre = this.subTypeGroup.controls.genre;
      if (genre) {
        genre.valueChanges.subscribe(x => {
          this.listSubGenre = [];
          if (genre.value && genre.value !== this.subTypeData.genre) {
            this.subTypeGroup.controls.subGenre.setValue('');
            this.fetchAndBindSubGenre(x.id);
            this.subTypeData.genre = genre.value;
          };
        });
        if (genre.value) {
          this.fetchAndBindSubGenre(genre.value.id);
        } else {
          this.listSubGenre = [];
          this.listSubGenreSelected = [];
        }
      }

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

  fetchAndBindSubGenre(genre: string) {
    this.appConfigService.fetchSubGenreByGenreCode(genre)
      .subscribe(data => {
        const genre = this.subTypeGroup.controls.genre.value;
        this.listSubGenre = data[genre.id];

        this.initMultipleSuggestionValue();
      });
  }

  fetchAndBindCity(country: string) {
    this.isLoadingCityList = true;
    this.appConfigService.fetchCitiesByCountryCode(country)
      .subscribe(cities => {
        this.isLoadingCityList = false;
        const country = this.subTypeGroup.controls.country.value;
        this.listCity = cities[country];
        this.changeDetectorRef.detectChanges();
      }, err => {
        this.isLoadingCityList = false;
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

    if (type === SUB_TYPES.MOVIES) {
      arrFieldsToEnable = [SHOW_INPUT_FIELDS.SHOW_LANGUAGE, SHOW_INPUT_FIELDS.DIALECT, SHOW_INPUT_FIELDS.GENRE, SHOW_INPUT_FIELDS.DURATION,
                          SHOW_INPUT_FIELDS.SUB_GENRE, SHOW_INPUT_FIELDS.CENSORSHIP_CLASS, SHOW_INPUT_FIELDS.SUBTITLING_DUBBING,
                          SHOW_INPUT_FIELDS.YEAR_DEBUTED, SHOW_INPUT_FIELDS.SEQUEL_NUMBER, SHOW_INPUT_FIELDS.EXPECTED_RELEASE_DATE];
    } else if (type === SUB_TYPES.SERIES) {
      arrFieldsToEnable = [SHOW_INPUT_FIELDS.SHOW_LANGUAGE, SHOW_INPUT_FIELDS.DIALECT, SHOW_INPUT_FIELDS.GENRE,
                          SHOW_INPUT_FIELDS.SUB_GENRE, SHOW_INPUT_FIELDS.CENSORSHIP_CLASS, SHOW_INPUT_FIELDS.SUBTITLING_DUBBING,
                          SHOW_INPUT_FIELDS.YEAR_DEBUTED, SHOW_INPUT_FIELDS.SEASON_NUMBER, SHOW_INPUT_FIELDS.EXPECTED_RELEASE_DATE];
    } else if (type === SUB_TYPES.PROGRAM) {
      arrFieldsToEnable = [SHOW_INPUT_FIELDS.SHOW_LANGUAGE, SHOW_INPUT_FIELDS.DIALECT, SHOW_INPUT_FIELDS.GENRE,
                          SHOW_INPUT_FIELDS.SUB_GENRE, SHOW_INPUT_FIELDS.CENSORSHIP_CLASS, SHOW_INPUT_FIELDS.SUBTITLING_DUBBING,
                          SHOW_INPUT_FIELDS.LIVE_RECORDED, SHOW_INPUT_FIELDS.YEAR_DEBUTED, SHOW_INPUT_FIELDS.SEASON_NUMBER];
    } else if (type === SUB_TYPES.NEWS) {
      arrFieldsToEnable = [SHOW_INPUT_FIELDS.SHOW_LANGUAGE, SHOW_INPUT_FIELDS.DIALECT, SHOW_INPUT_FIELDS.LIVE_RECORDED,
                          SHOW_INPUT_FIELDS.DURATION];
    } else if (type === SUB_TYPES.MATCH) {
      arrFieldsToEnable = [SHOW_INPUT_FIELDS.CITY, SHOW_INPUT_FIELDS.STADIUM_NAME, SHOW_INPUT_FIELDS.STADIUM_GPS,
                          SHOW_INPUT_FIELDS.DURATION, SHOW_INPUT_FIELDS.LIVE_RECORDED];
    } else if (type === SUB_TYPES.PLAY) {
      arrFieldsToEnable = [SHOW_INPUT_FIELDS.SHOW_LANGUAGE, SHOW_INPUT_FIELDS.DIALECT, SHOW_INPUT_FIELDS.GENRE,
                          SHOW_INPUT_FIELDS.SUB_GENRE, SHOW_INPUT_FIELDS.CENSORSHIP_CLASS, SHOW_INPUT_FIELDS.SUBTITLING_DUBBING,
                          SHOW_INPUT_FIELDS.DURATION, SHOW_INPUT_FIELDS.CITY, SHOW_INPUT_FIELDS.LIVE_RECORDED, SHOW_INPUT_FIELDS.YEAR_DEBUTED];
    }

    // add default fields
    arrFieldsToEnable.push(...this.defaultFields);

    return arrFieldsToEnable;
  }

  saveCommonValues(pageSubTypeData: ShowSubType, preType: string, curType: string): ShowSubType {
    if (this.subTypeGroup) {
      pageSubTypeData = new ShowSubType();

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

  switchType(type: string, pageSubTypeData: ShowSubType, keepCommonValue: boolean = true): ShowSubType {
    this.resetFields();
    this.needReInitFields = true;
    this.enableFields(this.getEnableFieldsBasedOnType(type));
    if (keepCommonValue) {
      pageSubTypeData = this.saveCommonValues(pageSubTypeData, this.type, type);
    } else {
      pageSubTypeData = new ShowSubType();
    }

    this.type = type;

    return pageSubTypeData;
  }

  getSubTypeFormGroup(pageSubTypeData: ShowSubType): FormGroup {
    let subTypeFormGroup: FormGroup;
    if (this.type === SUB_TYPES.MOVIES) {
      subTypeFormGroup = new FormGroup({
        arabicTitle: new FormControl(pageSubTypeData.arabicTitle, [Validators.required]),
        englishTitle: new FormControl(pageSubTypeData.englishTitle, [Validators.required]),
        showLanguage: new FormControl(pageSubTypeData.showLanguage, [Validators.required]),
        dialect: new FormControl(pageSubTypeData.dialect),
        genre: new FormControl(pageSubTypeData.genre, [Validators.required]),
        subGenre: new FormControl(pageSubTypeData.subGenre, [Validators.required]),
        censorshipClass: new FormControl(pageSubTypeData.censorshipClass),
        subtitlingDubbing: new FormControl(pageSubTypeData.subtitlingDubbing),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        country: new FormControl(pageSubTypeData.country, [Validators.required]),
        yearDebuted: new FormControl(pageSubTypeData.yearDebuted),
        sequelNumber: new FormControl(pageSubTypeData.sequelNumber),
        duration: new FormControl(pageSubTypeData.duration),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        bcmId: new FormControl(pageSubTypeData.bcmId),
        shahidId: new FormControl(pageSubTypeData.shahidId),
        expectedReleaseDate: new FormControl(pageSubTypeData.expectedReleaseDate),
      });
    } else if (this.type === SUB_TYPES.SERIES) {
      subTypeFormGroup = new FormGroup({
        arabicTitle: new FormControl(pageSubTypeData.arabicTitle, [Validators.required]),
        englishTitle: new FormControl(pageSubTypeData.englishTitle, [Validators.required]),
        showLanguage: new FormControl(pageSubTypeData.showLanguage, [Validators.required]),
        dialect: new FormControl(pageSubTypeData.dialect),
        genre: new FormControl(pageSubTypeData.genre, [Validators.required]),
        subGenre: new FormControl(pageSubTypeData.subGenre, [Validators.required]),
        censorshipClass: new FormControl(pageSubTypeData.censorshipClass),
        subtitlingDubbing: new FormControl(pageSubTypeData.subtitlingDubbing),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        country: new FormControl(pageSubTypeData.country, [Validators.required]),
        yearDebuted: new FormControl(pageSubTypeData.yearDebuted),
        seasonNumber: new FormControl(pageSubTypeData.seasonNumber),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        bcmId: new FormControl(pageSubTypeData.bcmId),
        shahidId: new FormControl(pageSubTypeData.shahidId),
        expectedReleaseDate: new FormControl(pageSubTypeData.expectedReleaseDate),
      });
    } else if (this.type === SUB_TYPES.PROGRAM) {
      subTypeFormGroup = new FormGroup({
        arabicTitle: new FormControl(pageSubTypeData.arabicTitle, [Validators.required]),
        englishTitle: new FormControl(pageSubTypeData.englishTitle, [Validators.required]),
        showLanguage: new FormControl(pageSubTypeData.showLanguage, [Validators.required]),
        dialect: new FormControl(pageSubTypeData.dialect),
        genre: new FormControl(pageSubTypeData.genre, [Validators.required]),
        subGenre: new FormControl(pageSubTypeData.subGenre),
        censorshipClass: new FormControl(pageSubTypeData.censorshipClass),
        subtitlingDubbing: new FormControl(pageSubTypeData.subtitlingDubbing),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        country: new FormControl(pageSubTypeData.country, [Validators.required]),
        liveRecorded: new FormControl(pageSubTypeData.liveRecorded),
        yearDebuted: new FormControl(pageSubTypeData.yearDebuted),
        seasonNumber: new FormControl(pageSubTypeData.seasonNumber),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        bcmId: new FormControl(pageSubTypeData.bcmId),
        shahidId: new FormControl(pageSubTypeData.shahidId),
      });
    } else if (this.type === SUB_TYPES.NEWS) {
      subTypeFormGroup = new FormGroup({
        arabicTitle: new FormControl(pageSubTypeData.arabicTitle, [Validators.required]),
        englishTitle: new FormControl(pageSubTypeData.englishTitle, [Validators.required]),
        showLanguage: new FormControl(pageSubTypeData.showLanguage, [Validators.required]),
        dialect: new FormControl(pageSubTypeData.dialect),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        country: new FormControl(pageSubTypeData.country, [Validators.required]),
        liveRecorded: new FormControl(pageSubTypeData.liveRecorded),
        duration: new FormControl(pageSubTypeData.duration),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        bcmId: new FormControl(pageSubTypeData.bcmId),
        shahidId: new FormControl(pageSubTypeData.shahidId),
      });
    } else if (this.type === SUB_TYPES.MATCH) {
      subTypeFormGroup = new FormGroup({
        arabicTitle: new FormControl(pageSubTypeData.arabicTitle, [Validators.required]),
        englishTitle: new FormControl(pageSubTypeData.englishTitle, [Validators.required]),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        country: new FormControl(pageSubTypeData.country, [Validators.required]),
        city: new FormControl(pageSubTypeData.city),
        stadiumName: new FormControl(pageSubTypeData.stadiumName),
        stadiumGPS: new FormControl(pageSubTypeData.stadiumGPS),
        liveRecorded: new FormControl(pageSubTypeData.liveRecorded),
        duration: new FormControl(pageSubTypeData.duration),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        bcmId: new FormControl(pageSubTypeData.bcmId),
        shahidId: new FormControl(pageSubTypeData.shahidId),
      });
    } else if (this.type === SUB_TYPES.PLAY) {
      subTypeFormGroup = new FormGroup({
        arabicTitle: new FormControl(pageSubTypeData.arabicTitle, [Validators.required]),
        englishTitle: new FormControl(pageSubTypeData.englishTitle, [Validators.required]),
        showLanguage: new FormControl(pageSubTypeData.showLanguage, [Validators.required]),
        dialect: new FormControl(pageSubTypeData.dialect),
        genre: new FormControl(pageSubTypeData.genre, [Validators.required]),
        subGenre: new FormControl(pageSubTypeData.subGenre),
        censorshipClass: new FormControl(pageSubTypeData.censorshipClass),
        subtitlingDubbing: new FormControl(pageSubTypeData.subtitlingDubbing),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        country: new FormControl(pageSubTypeData.country, [Validators.required]),
        city: new FormControl(pageSubTypeData.city),
        liveRecorded: new FormControl(pageSubTypeData.liveRecorded),
        yearDebuted: new FormControl(pageSubTypeData.yearDebuted),
        duration: new FormControl(pageSubTypeData.duration),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        bcmId: new FormControl(pageSubTypeData.bcmId),
        shahidId: new FormControl(pageSubTypeData.shahidId),
      });
    }

    return subTypeFormGroup;
  }

  isValid(): boolean {
    return this.subTypeGroup.valid;
  }

  onChangeGenre(event) {
    if (event) {
      const { id, names } = event;
      this.appConfigService.fetchSubGenreByGenreCode(id).subscribe(data => {
        this.listSubGenre = data[id];
      });
    }
  }

  initMultipleSuggestionValue() {
    if (this.subTypeData.subGenre) {
      const arrSubGenreSelected: any[] = this.listSubGenre.filter(item => this.subTypeData.subGenre.find(code => item.code === code));
      this.listSubGenreSelected = this.formatSubGenreList(arrSubGenreSelected);
    }
  }

  updateSubGenreFormControlValue = () => {
    this.subTypeGroup.controls.subGenre.setValue(this.listSubGenreSelected.map(x => x.id));
  }

  formatSubGenreList(arrData: any[]) {
    return arrData.map(item => {
      const value = item.names ? item.names[0].text : '';
      const objData = {
        id: item.code,
        value,
        raw: item
      };
      return objData;
    });
  }

  onRemoveSubGenre(data: any) {
    if (data) {
      this.listSubGenreSelected = this.listSubGenreSelected.filter(item => item.id != data.id )
      this.updateSubGenreFormControlValue();
    }
  }

  onAddedSubGenre(data: any) {
    if (data) {
      this.listSubGenreSelected.push(data);
      this.updateSubGenreFormControlValue();
    }
  }
}
