import { ISubType } from 'state/app-interfaces';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ProfileSubType } from 'models';
import { AppConfigService } from 'services';
import { storageConfigs, DEBOUNCE_TIME } from 'configs';
import { INPUT_FIELDS, SUB_TYPES, PAGE_TYPE } from 'constant';

import { getHoroscopeName } from 'utils';

@Component({
  selector: 'profile-subtype',
  templateUrl: './profile-subtype.component.html',
  styleUrls: ['./profile-subtype.component.scss'],

})
export class ProfileSubTypeComponent implements ISubType, OnInit {

  @Input() pageType: string;
  @Input() subTypeText: string;
  @Input() subTypeData: ProfileSubType;
  @Input() subTypeGroup: FormGroup;
  @Input() isFormSubmitted: boolean;

  private type: string = '';
  private needReInitFields: boolean = true;
  private inputFields: any = {
    fullName: false,
    playerNickName: false,
    occupations: false,
    title: false,
    dateOfBirth: false,
    ripDate: false,
    age: false,
    hideYearAndAge: false,
    //placeOfResidence: false, replace by country and city
    country: false,
    city: false,
    nationalities: false,
    gender: false,
    horoscope: false,
    realName: false,
    socialNetwork: false,
    about: false,
    weight: false,
    height: false,
    votingNumber: false,
    skillLevel: false,
    establishedYear: false,
    sportTeam: false,
    sportType: false,
    sportTypes: false,
    musicType: false,
    stadiumName: false,
    stadiumGPS: false,
    captainName: false,
    coachName: false,
  };

  public listStarClass: any[] = [
    {code: 'firstClass',  names: [{locale: 'en', text: 'First Class'}]},
    {code: 'secondClass', names: [{locale: 'en', text: 'Second Class'}]},
    {code: 'thirdClass',  names: [{locale: 'en', text: 'Third Class'}]},
  ];
  public listOccupation: any[];
  public listOccupationSuggestion: any[];
  public listOccupationSelected: any[];
  public listCountry: any[];
  public listCity: any;
  public listNationality: any;
  public listSkillLevel: any;
  public listSportType: any;
  public listMusicType: any;

  constructor(
    private localStorageService: LocalStorageService,
    private appConfigService: AppConfigService,
    private _sanitizer: DomSanitizer
  ) {
    this.listOccupationSuggestion = [];
    this.listOccupationSelected = [];
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.subTypeGroup && this.pageType === PAGE_TYPE.PROFILE) {
      if (this.needReInitFields) {
        this.needReInitFields = false;
        this.initDateFields();
      }

      const pageConfigs = this.localStorageService.retrieve(storageConfigs.page);
      if (pageConfigs && pageConfigs !== null) {
        this.listOccupation = pageConfigs['occupations'];
        this.listOccupationSuggestion = this.formatOccupationSuggestion(this.listOccupation);
        this.listCountry = pageConfigs['countries'];
        this.listNationality = pageConfigs['nationalities'];
        this.listSkillLevel = pageConfigs['skillLevels'];
        this.listSportType = pageConfigs['sportTypes'];
        this.listMusicType = pageConfigs['musicTypes'];
      } else {
        this.localStorageService
          .observe(storageConfigs.page)
          .subscribe(x => {
            this.listOccupation = x['occupations'];
            this.listOccupationSuggestion = this.formatOccupationSuggestion(this.listOccupation);
            this.listCountry = pageConfigs['countries'];
            this.listNationality = pageConfigs['nationalities'];
            this.listSkillLevel = pageConfigs['skillLevels'];
            this.listSportType = pageConfigs['sportTypes'];
            this.listMusicType = pageConfigs['musicTypes'];
          });
      }

      const country = this.subTypeGroup.controls.country;
      country.valueChanges.subscribe(x => {
        this.listCity = [];
        if (country.value && country.value !== this.subTypeData.country) {
          if (this.subTypeGroup.controls.city) {
            this.subTypeGroup.controls.city.setValue('');
            this.fetchAndBindCity(x);
          }
          this.subTypeData.country = country.value;
        };
      });
      if (country.value) {
        this.fetchAndBindCity(country.value);
      }
      this.initOccupation();
    }
  }

  initDateFields() {
    if (this.subTypeGroup.controls.dateOfBirth) {
      this.subTypeGroup.controls.dateOfBirth.valueChanges
        .debounceTime(DEBOUNCE_TIME)
        .subscribe(x => {
          this.subTypeGroup.controls.dateOfBirth.setErrors(null);
          const ripDateVal = null;
          if (this.isValidAge(this.subTypeGroup.controls.dateOfBirth, x, ripDateVal)) {
            this.subTypeGroup.controls.age.setValue(this.calculateAge(x, ripDateVal));
          }
        });
    }

    if (this.subTypeGroup.controls.dateOfBirth && this.subTypeGroup.controls.ripDate) {
      this.subTypeGroup.controls.dateOfBirth.valueChanges
        .debounceTime(DEBOUNCE_TIME)
        .subscribe(x => {
          this.subTypeGroup.controls.dateOfBirth.setErrors(null);
          this.subTypeGroup.controls.ripDate.setErrors(null);
          const ripDateVal = this.subTypeGroup.controls.ripDate.value;

          if (this.isValidAge(this.subTypeGroup.controls.dateOfBirth, x, ripDateVal)) {
            this.subTypeGroup.controls.age.setValue(this.calculateAge(x, ripDateVal));
          }
        });

      this.subTypeGroup.controls.ripDate.valueChanges
        .debounceTime(DEBOUNCE_TIME)
        .subscribe(x => {
          this.subTypeGroup.controls.dateOfBirth.setErrors(null);
          this.subTypeGroup.controls.ripDate.setErrors(null);
          const dobDateVal = this.subTypeGroup.controls.dateOfBirth.value;

          if (this.isValidAge(this.subTypeGroup.controls.ripDate, dobDateVal, x)) {
            this.subTypeGroup.controls.age.setValue(this.calculateAge(dobDateVal, x));
          }
        });
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

    if (type === SUB_TYPES.STAR) {
      arrFieldsToEnable = [INPUT_FIELDS.FULL_NAME, INPUT_FIELDS.CLASS, INPUT_FIELDS.OCCUPATATION, INPUT_FIELDS.ARTISTIC_TITLE,
                          INPUT_FIELDS.DOB, INPUT_FIELDS.RIP_DATE, INPUT_FIELDS.AGE,
                          INPUT_FIELDS.HIDE_YEAR_AND_AGE, INPUT_FIELDS.COUNTRY, INPUT_FIELDS.CITY,
                          INPUT_FIELDS.NATIONALITY, INPUT_FIELDS.GENDER, INPUT_FIELDS.HOROSCOPE,
                          INPUT_FIELDS.FULL_REAL_NAME, INPUT_FIELDS.SOCIAL_NETWORK, INPUT_FIELDS.ABOUT];
    } else if (type === SUB_TYPES.SPORT_PLAYER) {
      arrFieldsToEnable = [INPUT_FIELDS.FULL_NAME, INPUT_FIELDS.CLASS, INPUT_FIELDS.NICK_NAME, INPUT_FIELDS.OCCUPATATION,
                          INPUT_FIELDS.DOB, INPUT_FIELDS.RIP_DATE, INPUT_FIELDS.AGE,
                          INPUT_FIELDS.HIDE_YEAR_AND_AGE, INPUT_FIELDS.COUNTRY, INPUT_FIELDS.CITY, INPUT_FIELDS.NATIONALITY,
                          INPUT_FIELDS.GENDER, INPUT_FIELDS.HOROSCOPE, INPUT_FIELDS.FULL_REAL_NAME,
                          INPUT_FIELDS.SOCIAL_NETWORK, INPUT_FIELDS.ABOUT, INPUT_FIELDS.WEIGHT,
                          INPUT_FIELDS.HEIGHT, INPUT_FIELDS.SKILL_LEVEL, INPUT_FIELDS.SPORT_TYPE];
    } else if (type === SUB_TYPES.GUEST) {
      arrFieldsToEnable = [INPUT_FIELDS.FULL_NAME, INPUT_FIELDS.CLASS, INPUT_FIELDS.OCCUPATATION,
                          INPUT_FIELDS.DOB, INPUT_FIELDS.AGE,
                          INPUT_FIELDS.HIDE_YEAR_AND_AGE, INPUT_FIELDS.COUNTRY, INPUT_FIELDS.CITY, INPUT_FIELDS.NATIONALITY,
                          INPUT_FIELDS.GENDER, INPUT_FIELDS.HOROSCOPE, INPUT_FIELDS.FULL_REAL_NAME,
                          INPUT_FIELDS.SOCIAL_NETWORK, INPUT_FIELDS.ABOUT];
    } else if (type === SUB_TYPES.TALENT) {
      arrFieldsToEnable = [INPUT_FIELDS.FULL_NAME, INPUT_FIELDS.CLASS, INPUT_FIELDS.OCCUPATATION, INPUT_FIELDS.ARTISTIC_TITLE,
                          INPUT_FIELDS.DOB, INPUT_FIELDS.AGE, INPUT_FIELDS.RIP_DATE,
                          INPUT_FIELDS.HIDE_YEAR_AND_AGE, INPUT_FIELDS.COUNTRY, INPUT_FIELDS.CITY, INPUT_FIELDS.NATIONALITY,
                          INPUT_FIELDS.GENDER, INPUT_FIELDS.HOROSCOPE, INPUT_FIELDS.FULL_REAL_NAME,
                          INPUT_FIELDS.SOCIAL_NETWORK, INPUT_FIELDS.ABOUT, INPUT_FIELDS.VOTING_NUMBER];
    } else if (type === SUB_TYPES.SPORT_TEAM) {
      arrFieldsToEnable = [INPUT_FIELDS.FULL_NAME, INPUT_FIELDS.NICK_NAME, INPUT_FIELDS.COUNTRY, INPUT_FIELDS.CITY,
                          INPUT_FIELDS.SOCIAL_NETWORK, INPUT_FIELDS.ABOUT, INPUT_FIELDS.ESTABLISHED_YEAR,
                          INPUT_FIELDS.SPORT_TEAM, INPUT_FIELDS.SPORT_TYPE_MULTI, INPUT_FIELDS.STADIUM_NAME,
                          INPUT_FIELDS.STADIUM_GPS, INPUT_FIELDS.CAPTAIN_NAME, INPUT_FIELDS.COACH_NAME];
    } else if (type === SUB_TYPES.BAND) {
      arrFieldsToEnable = [INPUT_FIELDS.FULL_NAME, INPUT_FIELDS.COUNTRY, INPUT_FIELDS.CITY, INPUT_FIELDS.SOCIAL_NETWORK,
                          INPUT_FIELDS.ABOUT, INPUT_FIELDS.ESTABLISHED_YEAR, INPUT_FIELDS.MUSIC_TYPE];
    }

    return arrFieldsToEnable;
  }

  saveCommonValues(pageSubTypeData: ProfileSubType, preType: string, curType: string): ProfileSubType {
    if (this.subTypeGroup) {
      pageSubTypeData = new ProfileSubType();

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

  switchType(type: string, pageSubTypeData: ProfileSubType, keepCommonValue: boolean = true): ProfileSubType {
    this.resetFields();
    this.needReInitFields = true;

    this.enableFields(this.getEnableFieldsBasedOnType(type));
    if (keepCommonValue) {
      pageSubTypeData = this.saveCommonValues(pageSubTypeData, this.type, type);
    } else {
      pageSubTypeData = new ProfileSubType();
    }

    this.type = type;

    return pageSubTypeData;
  }

  getSubTypeFormGroup(pageSubTypeData: ProfileSubType): FormGroup {
    const dobControl = new FormControl(pageSubTypeData.dateOfBirth);
    const ageControl = new FormControl(pageSubTypeData.age);
    const horoscopeControl = new FormControl(pageSubTypeData.horoscope);
    const ripDateControl = new FormControl(pageSubTypeData.ripDate);

    dobControl.valueChanges.do(dobDate => {
      if (dobDate) {
        const convertedBirthDate = new Date(dobDate);

        if (convertedBirthDate != null) {
          horoscopeControl.setValue(getHoroscopeName(convertedBirthDate));
        }
      }

      return dobDate;
    }).subscribe();

    let subTypeFormGroup: FormGroup;
    if (this.type === SUB_TYPES.STAR) {
      subTypeFormGroup = new FormGroup({
        fullName: new FormControl(pageSubTypeData.fullName, [Validators.required]),
        class: new FormControl(pageSubTypeData.class),
        occupations: new FormControl(pageSubTypeData.occupations, [Validators.required]),
        title: new FormControl(pageSubTypeData.title),
        dateOfBirth: dobControl,
        ripDate: ripDateControl,
        age: ageControl,
        hideYearAndAge: new FormControl(pageSubTypeData.hideYearAndAge),
        country: new FormControl(pageSubTypeData.country),
        city: new FormControl(pageSubTypeData.city),
        nationalities: new FormControl(pageSubTypeData.nationalities, [Validators.required]),
        gender: new FormControl(pageSubTypeData.gender, [Validators.required]),
        horoscope: horoscopeControl,
        realName: new FormControl(pageSubTypeData.realName),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        about: new FormControl(pageSubTypeData.about, [Validators.required])
      });
    } else if (this.type === SUB_TYPES.SPORT_PLAYER) {
      subTypeFormGroup = new FormGroup({
        fullName: new FormControl(pageSubTypeData.fullName, [Validators.required]),
        playerNickName: new FormControl(pageSubTypeData.playerNickName),
        class: new FormControl(pageSubTypeData.class),
        occupations: new FormControl(pageSubTypeData.occupations, [Validators.required]),
        dateOfBirth: dobControl,
        ripDate: ripDateControl,
        age: ageControl,
        hideYearAndAge: new FormControl(pageSubTypeData.hideYearAndAge),
        country: new FormControl(pageSubTypeData.country),
        city: new FormControl(pageSubTypeData.city),
        nationalities: new FormControl(pageSubTypeData.nationalities, [Validators.required]),
        gender: new FormControl(pageSubTypeData.gender, [Validators.required]),
        horoscope: horoscopeControl,
        realName: new FormControl(pageSubTypeData.realName),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        weight: new FormControl(pageSubTypeData.weight),
        height: new FormControl(pageSubTypeData.height),
        skillLevel: new FormControl(pageSubTypeData.skillLevel, [Validators.required]),
        sportType: new FormControl(pageSubTypeData.sportType, [Validators.required]),
      });
    } else if (this.type === SUB_TYPES.GUEST) {
      subTypeFormGroup = new FormGroup({
        fullName: new FormControl(pageSubTypeData.fullName, [Validators.required]),
        class: new FormControl(pageSubTypeData.class),
        occupations: new FormControl(pageSubTypeData.occupations, [Validators.required]),
        dateOfBirth: dobControl,
        age: ageControl,
        hideYearAndAge: new FormControl(pageSubTypeData.hideYearAndAge),
        country: new FormControl(pageSubTypeData.country),
        city: new FormControl(pageSubTypeData.city),
        nationalities: new FormControl(pageSubTypeData.nationalities, [Validators.required]),
        gender: new FormControl(pageSubTypeData.gender, [Validators.required]),
        horoscope: horoscopeControl,
        realName: new FormControl(pageSubTypeData.realName),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
      });
    } else if (this.type === SUB_TYPES.TALENT) {
      subTypeFormGroup = new FormGroup({
        fullName: new FormControl(pageSubTypeData.fullName, [Validators.required]),
        class: new FormControl(pageSubTypeData.class),
        occupations: new FormControl(pageSubTypeData.occupations, [Validators.required]),
        title: new FormControl(pageSubTypeData.title),
        dateOfBirth: dobControl,
        ripDate: ripDateControl,
        age: ageControl,
        hideYearAndAge: new FormControl(pageSubTypeData.hideYearAndAge),
        country: new FormControl(pageSubTypeData.country),
        city: new FormControl(pageSubTypeData.city),
        nationalities: new FormControl(pageSubTypeData.nationalities, [Validators.required]),
        gender: new FormControl(pageSubTypeData.gender, [Validators.required]),
        horoscope: horoscopeControl,
        realName: new FormControl(pageSubTypeData.realName),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        votingNumber: new FormControl(pageSubTypeData.votingNumber, [Validators.required]),
      });
    } else if (this.type === SUB_TYPES.SPORT_TEAM) {
      subTypeFormGroup = new FormGroup({
        fullName: new FormControl(pageSubTypeData.fullName, [Validators.required]),
        playerNickName: new FormControl(pageSubTypeData.playerNickName),
        country: new FormControl(pageSubTypeData.country),
        city: new FormControl(pageSubTypeData.city),
        realName: new FormControl(pageSubTypeData.realName),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        sportTeam: new FormControl(pageSubTypeData.sportTeam, [Validators.required]),
        sportTypes: new FormControl(pageSubTypeData.sportTypes, [Validators.required]),
        establishedYear: new FormControl(pageSubTypeData.establishedYear),
        stadiumName: new FormControl(pageSubTypeData.stadiumName),
        stadiumGPS: new FormControl(pageSubTypeData.stadiumGPS),
        captainName: new FormControl(pageSubTypeData.captainName),
        coachName: new FormControl(pageSubTypeData.coachName),
      });
    } else if (this.type === SUB_TYPES.BAND) {
      subTypeFormGroup = new FormGroup({
        fullName: new FormControl(pageSubTypeData.fullName, [Validators.required]),
        country: new FormControl(pageSubTypeData.country),
        city: new FormControl(pageSubTypeData.city),
        socialNetwork: new FormControl(pageSubTypeData.socialNetwork),
        about: new FormControl(pageSubTypeData.about, [Validators.required]),
        establishedYear: new FormControl(pageSubTypeData.establishedYear, [Validators.required]),
        musicType: new FormControl(pageSubTypeData.musicType, [Validators.required]),
      });
    }

    if (subTypeFormGroup.controls.age) {
      subTypeFormGroup.controls.age.disable({ onlySelf: true });
    }
    if (subTypeFormGroup.controls.horoscope) {
      subTypeFormGroup.controls.horoscope.disable({ onlySelf: true });
    }

    return subTypeFormGroup;
  }

  isValid(): boolean {
    this.validateAge();
    this.validateEstablishedYear();
    return this.subTypeGroup.valid;
  }

  validateAge(): void {
    if (this.subTypeGroup.controls.dateOfBirth && this.subTypeGroup.controls.ripDate) {
      const ripDateVal = this.subTypeGroup.controls.ripDate.value;
      const dobDateVal = this.subTypeGroup.controls.dateOfBirth.value;

      this.subTypeGroup.controls.dateOfBirth.setErrors(null);
      this.subTypeGroup.controls.ripDate.setErrors(null);
      this.isValidAge(this.subTypeGroup.controls.ripDate, dobDateVal, ripDateVal);
      this.isValidAge(this.subTypeGroup.controls.dateOfBirth, dobDateVal, ripDateVal);
    }
  }

  isValidAge(formControl: AbstractControl, dob: any, rip: any): boolean {
    let isValid;
    if (!dob && !rip)
      return isValid = true;

    if (dob) {
      const convertDobDate = new Date(dob);
      let ripDate = new Date();
      if (rip)
        ripDate = rip;
      isValid = convertDobDate <= ripDate;
    }

    if (!isValid) {
      formControl.setErrors({ invalidValue: true });
    }
    return isValid;
  }

  calculateAge(dob: any, rip: any): number {
    let age = 0;
    if (dob) {
      const convertDobDate = new Date(dob);
      let ripDate = new Date();
      if (rip)
        ripDate = rip;
      age = ripDate.getFullYear() - convertDobDate.getFullYear();
    }

    return age;
  }

  validateEstablishedYear(): void {
    const estYearControl: AbstractControl = this.subTypeGroup.controls.establishedYear;
    if (estYearControl && this.type !== SUB_TYPES.SPORT_TEAM) {
      estYearControl.setErrors(null);
      if (!estYearControl.value) {
        estYearControl.setErrors({ invalidValue: true });
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

  autocompleListFormatter = (data: any): SafeHtml => {
    const html = `<span>${data.value}</span>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }

  formatOccupationSuggestion = (occupations: any[]) => {
    return occupations.map(item => {
      const value = item.names ? item.names[0].text : '';
      return {
        id: item.code,
        value,
        raw: item
      }
    });
  }

  initOccupation = () => {
    if (this.subTypeData.occupations) {
      const arrOccupationsSelected: any[] = this.subTypeData.occupations.map(code => this.listOccupation.find(item => item.code == code));
      this.listOccupationSelected = this.formatOccupationSuggestion(arrOccupationsSelected);
    }
  }

  updateOccupationFormControlValue = () => {
    this.subTypeGroup.controls.occupations.setValue(this.listOccupationSelected.map(x=>x.id));
  }

  /**
   * Query all occupations matched parameters then fill to control.
   *
   * @param {any} { val: string, updateEvent: BehaviorSubject<any> }
   *
   * @memberOf PageSubTypeStartComponent
   */
  onQueryOccupation({ val, updateEvent }) {
    const filteredOccupations = this.formatOccupationSuggestion(
      this.listOccupation.filter(item=> {
        const value = item.names ? item.names[0].text : '';
        return value.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    );
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    _updateEvent.next(filteredOccupations);
  }

  /**
   * Remove occupation.
   *
   * @param {*} data
   *
   * @memberOf PageSubTypeStartComponent
   */
  onRemoveOccupation(data: any) {
    if (data) {
      this.listOccupationSelected = this.listOccupationSelected.filter(item => item.id != data.id )
      this.updateOccupationFormControlValue();
    }
  }

  /**
   * Remove occupation.
   *
   * @param {*} data
   *
   * @memberOf PageSubTypeStartComponent
   */
  onAddedOccupation(data: any) {
    if (data) {
      this.listOccupationSelected.push(data);
      this.updateOccupationFormControlValue();
    }
  }

}
