import {
    Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, Optional, ViewChild, AfterViewInit
} from '@angular/core';
import { FormGroup, FormControl, NgModel, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';

import { storageConfigs } from 'configs';
import { PageSetting } from 'models';
import { FORM_STATE } from 'constant';
import { ColorPicker } from 'primeng/primeng';

@Component({
    selector: 'page-tab-settings',
    styleUrls: ['page-tab-settings.scss'],
    templateUrl: 'page-tab-settings.html'
})

export class PageTabSettingsComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() isFormSubmitted: boolean;
  @Input() settings: PageSetting;

  @Output() modelChanged = new EventEmitter<PageSetting>();
  @Output() statusChanged = new EventEmitter<any>();

  @ViewChild('accentColorPicker') public accentColorPicker: ColorPicker;
  @ViewChild('headerColorPicker') public headerColorPicker: ColorPicker;


  public yesChoice: boolean = true;
  public noChoice: boolean = false;

  public hidePageTabs: any[];
  public landingTabs: any[];
  public arrLandingPages: any[];
  public settingsGroup: FormGroup;
  public accentColor: string;
  public headerColor: string;

  private numPageHide: number = 0;

  private EXCLUDE_FROM_HIDE_PAGE_TABS_CODE: Array<string> = ['newsfeed'];

  constructor(
    @Optional() ngModel: NgModel,
    private localStorageService: LocalStorageService
  ) {
    const pageConfigs = this.localStorageService.retrieve(storageConfigs.page);
    if (pageConfigs && pageConfigs !== null) {
      this.hidePageTabs = this.getPageTabs(pageConfigs);
      this.arrLandingPages = this.landingTabs = [...pageConfigs.pageTabs];
    } else{
      this.localStorageService
      .observe(storageConfigs.page)
      .subscribe(configs=> {
        this.hidePageTabs = this.getPageTabs(configs);
        this.arrLandingPages = this.landingTabs = [...configs.pageTabs];
      });
    }
  }

  ngAfterViewInit() {
    const BLACK_HEX = 'ffffff';
    this.accentColorPicker.defaultColor = BLACK_HEX;
    this.accentColorPicker.writeValue(undefined);

    this.headerColorPicker.defaultColor = BLACK_HEX;
    this.headerColorPicker.writeValue(undefined);
  }


  getPageTabs(pageConfigs){
    return pageConfigs.pageTabs.filter(e => !~this.EXCLUDE_FROM_HIDE_PAGE_TABS_CODE.indexOf(e.code));
  }

  /**
   * Init FormGroup for setting tab
   *
   * @param {PageSetting} settings
   * @returns {FormGroup}
   *
   * @memberOf PageFormComponent
   */
  initialFormGroup(): void {
    const settingsGroup = new FormGroup({
      showMenuTabs: new FormControl(this.settings.showMenuTabs),
      showContentBundles: new FormControl(this.settings.showContentBundles),
      hidePageTabs: new FormControl(this.settings.hidePageTabs),
      featureOnMainMenu: new FormControl(this.settings.featureOnMainMenu),
      selectLandingTab: new FormControl(this.settings.selectLandingTab),
      allowUsersFollowPage: new FormControl(this.settings.allowUsersFollowPage),
      allowUsersWritePageFanHub: new FormControl(this.settings.allowUsersWritePageFanHub),
      allowUsersSearch: new FormControl(this.settings.allowUsersSearch),
      hide: new FormControl(this.settings.hide),
      enableInstantPublishing: new FormControl(this.settings.enableInstantPublishing),
      allowTag: new FormControl(this.settings.allowTag),
      enableEditorialApprovalWorkflow: new FormControl(this.settings.enableEditorialApprovalWorkflow),
      searchable: new FormControl(this.settings.searchable),
      accentColor: new FormControl(this.settings.accentColor),
      headerColor: new FormControl(this.settings.headerColor)
    });
    settingsGroup.valueChanges.debounceTime(100).subscribe(value => {
      const { hidePageTabs: arrPageHidden } = value,
            { selectLandingTab } = settingsGroup.controls;

      if (this.numPageHide !== arrPageHidden.length) {
        let indexPage: number = 0,
            landingPageArr: any = this.arrLandingPages.slice();

        this.landingTabs = landingPageArr.filter(page => {
          if (arrPageHidden.indexOf(page.code) >= 0) {
            return false;
          }

          return true;
        });

        if (arrPageHidden.indexOf(selectLandingTab.value) >= 0) {
          selectLandingTab.setValue('newsfeed');
        }
      }

      this.modelChanged.emit(settingsGroup.getRawValue());
    });
    settingsGroup.statusChanges.subscribe(status => {
      this.statusChanged.emit({status});
    });

    this.settingsGroup = settingsGroup;
    this.numPageHide = this.settingsGroup.controls.hidePageTabs.value.length;
  }

  ngOnInit() { }

  bindStateToForm(): void {
    if (!this.settingsGroup) {
      this.initialFormGroup();
      return;
    }

    const { controls: formControls } = this.settingsGroup;
    Object.keys(formControls).map((key, idx, arr) => {
      const model = this.settings;
      formControls[key].setValue(model[key]);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.settings) {
      this.bindStateToForm();
    }
  }

  onResetHidePageSettingsHandler(event) {
    event.preventDefault();
    this.settingsGroup.controls.hidePageTabs.setValue([]);
    this.landingTabs = this.arrLandingPages.slice();
  }
}
