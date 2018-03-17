import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { select } from '@angular-redux/store';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { storageConfigs, getEndpoint, DEBOUNCE_TIME } from 'configs';
import { PageInfo, PageGroup, ImageInfo } from 'models';
import { FORM_STATE, PAGE_STATUS, CONFIG_VALUE } from 'constant';
import { ContentService, PageGroupService, AppConfigService } from 'services';
import { registerUniqueValidator, nospaceValidator } from 'utils/validator';
import { PageActions } from 'state';
import { notEmpty, emptyObject } from 'modules';
import { MBCConfirmationComponent } from "components/mbcConfirmation";

@Component({
    selector: 'page-tab-info',
    styleUrls: ['page-tab-info.scss'],
    templateUrl: 'page-tab-info.html',
})

export class PageTabInfoComponent implements OnInit, OnChanges {

    @select(['page', 'form', 'page',  'info', 'internalUniquePageName']) internalUniquePageName$: Observable<string>;
    @select(['page', 'form', 'page',  'info', 'customURL']) customURL$: Observable<string>;
    @ViewChild('confirmSwitchType') public confirmSwitchTypePopUp: MBCConfirmationComponent;

    @Input() isFormSubmitted: boolean;
    @Input() info: PageInfo;
    @Input() pageGroup: PageGroup;
    @Input() pageEntityId: string;
    @Input() pageStatus: string;
    @Input() copyFromId: string;

    @Output() modelChanged = new EventEmitter<any>();
    @Output() statusChanged = new EventEmitter<any>();

    public pageTypes: string[];
    public infoGroup: FormGroup;
    public originalPageName: string = '';
    public originalCustomURL: string = '';
    public listGEOSelectedFromSuggestion: any[] = [];
    private countries: any[];
    private regions: any[];
    private configData;
    public listGeoTarget;
    public geoWorldWidePlaceHolder: string = '';
    public isReadOnly: boolean = false;
    private previousType: string = '';

    constructor(
        private localStorageService: LocalStorageService,
        private contentService: ContentService,
        private pageGroupService: PageGroupService,
        private pageActions: PageActions,
        private appConfigService: AppConfigService
    ) {
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

    initialFormGroup(): void {
      const infoGroup = new FormGroup({
          type: new FormControl(this.info.type, [Validators.required]),
          language: new FormControl(this.info.language),
          internalUniquePageName: new FormControl(this.info.internalUniquePageName, [Validators.required, nospaceValidator], this.validateUniquePageName.bind(this)),
          title: new FormControl(this.info.title, [Validators.required, nospaceValidator]),
          customURL: new FormControl(this.info.customURL, [], this.validateUniqueCustomURL.bind(this)),
          pageGroup: new FormControl(this.pageGroup),
          geoSuggestions: new FormControl(this.info.geoSuggestions),
          geoTargeting: new FormControl(this.info.geoTargeting),
          website: new FormControl(this.info.website),
          logoURL: new FormControl(this.info.logoURL),
          posterURL: new FormControl(this.info.posterURL),
          coverURL: new FormControl(this.info.coverURL)
      });

      infoGroup.statusChanges
        .subscribe(status => {
          this.statusChanged.emit({ status });
        });
      infoGroup.valueChanges
        .subscribe(x => {
          //'x' lack of 'type' field because of it's disabled, must use infoGroup.getRawValue()
          if (this.previousType === this.infoGroup.getRawValue().type) {
            this.modelChanged.emit(this.infoGroup.getRawValue());
          } else {
            this.isChangeType(this.infoGroup.getRawValue().type);
          }
        });
      this.infoGroup = infoGroup;
    }

    validateUniquePageName(control: AbstractControl) {
      return new Promise(resolve => {
        const origVal =  this.originalPageName ? this.originalPageName.trim() : '';
        const newVal = control.value ? control.value.trim() : '';

        if (newVal && newVal !== origVal) {
          this.contentService.checkExist('data.info.internalUniquePageName', newVal).subscribe(res => {
            if (res.result) {
              resolve({asyncInvalid: true});
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      });
    }

    validateUniqueCustomURL(control: AbstractControl) {
      return new Promise(resolve => {
        const origVal =  this.originalCustomURL ? this.originalCustomURL.trim() : '';
        const newVal = control.value ? control.value.trim() : '';
        if (newVal && newVal !== origVal) {
          this.contentService.checkExist('data.info.customURL', newVal).subscribe(res => {
            if (res.result) {
              resolve({asyncInvalid: true});
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      });
    }

    bindStateToForm(): void {
        if (!this.infoGroup) {
            this.initialFormGroup();
            return;
        }
        const { controls: formControls } = this.infoGroup;
        Object.keys(formControls).map((key, idx, arr) => {
            const model = this.info;
            if (model[key]) {
                formControls[key].setValue(model[key]);
            }
        });
    }

    setPageTypeState() {
        if (!this.pageStatus || this.pageStatus === PAGE_STATUS.DRAFT) {
            this.infoGroup.controls['type'].enable();
        } else {
            this.infoGroup.controls['type'].disable({ onlySelf: true });
        }
    }

    ngOnInit() {
      this.internalUniquePageName$.subscribe(pageName => {
        this.originalPageName = pageName;
      });
      this.customURL$.subscribe(url => {
        this.originalCustomURL = url;
      });

      this.pageActions.fetchConfigByTypes();
      const pageConfigs = this.localStorageService.retrieve(storageConfigs.page);

      this.countries = pageConfigs[CONFIG_VALUE.COUNTRY];
      this.regions = pageConfigs [CONFIG_VALUE.REGION];

      this.configData = {
                          'Worldwide': '',
                          'Region': CONFIG_VALUE.REGION,
                          'Country': CONFIG_VALUE.COUNTRY,
                          'City': CONFIG_VALUE.CITY
                      };

      this.listGeoTarget = [];
      for (var key in this.configData) this.listGeoTarget.push(key);
    }

    ngOnChanges(changes: SimpleChanges) {
      if (changes.info) {
        this.bindStateToForm();
      }

      if (changes.pageGroup) {
        this.infoGroup.controls.pageGroup.setValue(changes.pageGroup.currentValue);
      }

      if(changes.pageStatus) {
        this.setPageTypeState();
      }

      this.listGEOSelectedFromSuggestion = this.infoGroup.controls.geoSuggestions.value.map((p) => ({ name:p }));
      if (!this.infoGroup.controls['type'].value) {
        this.isReadOnly = true;
        return;
      }
      this.isReadOnly = false;
    }

    isCopyPage() {
        let isCopy = false;
        if (this.copyFromId) {
            isCopy = true;
        }
        return isCopy;
    }

    isEditPage() {
        let isEdit = false;
        if (this.pageEntityId) {
            isEdit = true;
        }
        return isEdit;
    }

    onQueryPageGroup({ val, updateEvent }) {
        const _updateEvent: BehaviorSubject<any> = updateEvent;
        this.pageGroupService
            .suggestPageGroups('group_contains_page', val, this.infoGroup.controls['type'].value)
            .subscribe(listPage => {
                _updateEvent.next(listPage.map((p) => ({ pageGroupId: p.entityId, pageGroupName: p.title })));
            });
    }

    onQueryGeoTargeting({ val, updateEvent }) {
        const _updateEvent: BehaviorSubject<any> = updateEvent;
        const pageConfigs = this.localStorageService.retrieve(storageConfigs.page);

        let suggestionResults =[];
        const selectedGeo = this.infoGroup.controls.geoTargeting.value;
        if (this.configData[selectedGeo] === CONFIG_VALUE.REGION) {
            this.regions.forEach(element => {
                if(element.names[0].text.toLowerCase().match(val.toLowerCase()) !== null) {
                    suggestionResults.push(element.names[0].text);
                }
            });
            _updateEvent.next(suggestionResults.slice(0,5).map(
                    (r) => ({name: r})
            ));
        }
        else if (this.configData[selectedGeo] === CONFIG_VALUE.COUNTRY) {
            this.countries.forEach(element => {
                if(element.names[0].text.toLowerCase().match(val.toLowerCase()) !== null)
                    suggestionResults.push(element.names[0].text);
            });
            _updateEvent.next(suggestionResults.slice(0,5).map(
                    (r) => ({name: r})
            ));
        }
        else {
            this.appConfigService.suggestCity(val).subscribe(data => {
                const suggestCity = data;
                let allCountriesAndRegions = [];
                if (this.configData[selectedGeo] !== CONFIG_VALUE.CITY) {
                    allCountriesAndRegions.push.apply(allCountriesAndRegions, this.countries);
                    allCountriesAndRegions.push.apply(allCountriesAndRegions, this.regions);
                    allCountriesAndRegions.forEach(element => {
                        if(element.names[0].text.match(val) !== null)
                            suggestionResults.push(element.names[0].text);
                    });
                }

            suggestionResults.push.apply(suggestionResults, suggestCity);
            _updateEvent.next(suggestionResults.slice(0,5).map(
                    (r) => ({name: r})));
            });
        }
    }

    clearSuggestedGeo() {
        this.listGEOSelectedFromSuggestion = [];
        this.geoWorldWidePlaceHolder = '';
        this.updateGeoFormControlValue();
    }

    onPageGroupChanged(data: any, src) {
      this.pageActions.changePageGroup(data);
    }

    requiredInternalUniquePageName() {
        const uniquePageName = this.infoGroup.controls.internalUniquePageName;
        return (uniquePageName.errors && uniquePageName.errors.required) || uniquePageName.value === '';
    }

    onImageChange(formControl: AbstractControl, imageInfo: ImageInfo){
        formControl.setValue(imageInfo);
    }

    onAddGeo(newLocation: any) {
        if (newLocation) {
            this.listGEOSelectedFromSuggestion.push(newLocation);
        }
        this.updateGeoFormControlValue();
    }

    onRemoveGeo(location: any) {
        if (location) {
            this.listGEOSelectedFromSuggestion =  this.listGEOSelectedFromSuggestion.filter(item => item !== location)
        }
        this.updateGeoFormControlValue();
    }

    updateGeoFormControlValue = () => {
        if (!this.info.geoSuggestions)
             this.info.geoSuggestions = [];
        if (this.infoGroup.controls.geoTargeting.value === "Worldwide") {
          this.geoWorldWidePlaceHolder = "Target World Wide"
        }

        this.infoGroup.controls.geoSuggestions.setValue(this.listGEOSelectedFromSuggestion.map(x => x.name));
        this.info.geoSuggestions = this.listGEOSelectedFromSuggestion.map(x => x.name);

    }

    isNotChoosingGeoTargeting() {
        if (this.infoGroup.controls.geoTargeting.value === "empty")
            this.infoGroup.controls.geoTargeting.setValue("");
        return (!this.infoGroup.controls.geoTargeting.value) || this.infoGroup.controls.geoTargeting.value === "Worldwide";
    }

    isGeoValidate() {
        const isGeoTargetChosen = !this.isNotChoosingGeoTargeting();
        if(isGeoTargetChosen && this.listGEOSelectedFromSuggestion.length === 0) {
            this.infoGroup.controls.geoSuggestions.setErrors({invalidValue : true})
            return true;
        }
    }

    isChangeType(type) {
      if (this.previousType)
        this.confirmSwitchTypePopUp.show();
      else
        this.onAcceptSwitchType();
    }
    onAcceptSwitchType(){
      this.previousType = this.infoGroup.controls.type.value;
      this.setReadOnly();
      this.modelChanged.emit(this.infoGroup.getRawValue());
    }

    onDeclineSwitchType(){
      this.infoGroup.controls.type.setValue(this.previousType);
      this.setReadOnly();
    }

    setReadOnly() {
      if (this.infoGroup.controls.type.value == '') {
        this.isReadOnly = true;
      } else {
        this.isReadOnly = false;
      }
    }
}
