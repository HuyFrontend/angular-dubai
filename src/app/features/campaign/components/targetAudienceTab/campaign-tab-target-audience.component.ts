import { Component, ViewChild, AfterViewInit, OnInit, Input, OnDestroy } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { NgForm, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Campaign, PageSuggestionRequest } from 'models';
import { CampaignActions } from 'state';
import { LocalStorageService } from 'ngx-webstorage';
import { storageConfigs } from 'configs';
import { getInterestSuggestions, getAllInterestNode } from 'utils/config-helper';
import { CONFIG_VALUE, LOGIN_STATUS, GENDER } from 'constant';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PageService, ContentService, AppConfigService } from 'services';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'campaign-tab-target-audience',
  styleUrls: ['campaign-tab-target-audience.scss'],
  templateUrl: 'campaign-tab-target-audience.html',
})

export class CampaignTabTargetAudienceComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('audienceForm') form: NgForm;
  @select(['forms', 'campaign']) campaign$: Observable<Campaign>;
  @Input() isSubmitting: boolean;
  public campaign: Campaign = new Campaign();

  private countries: any[];
  private regions: any[];
  private interests: any[];
  private subscriptionPageSuggestion: Subscription;
  public nationalities: any[];
  public locationList: {name?: string}[];
  public pageList: any[];
  public interestList: any[];
  public loginStatus: string;
  public genderStatus: string;
  public isShowElement: boolean;

  constructor(private campaignAction: CampaignActions,
    private localStorageService: LocalStorageService,
    private pageService: PageService,
    private appService: AppConfigService
  ) {

    this.locationList = [];
    this.pageList = [];
    this.interestList = [];
    this.subscriptionPageSuggestion = new Subscription();
    this.loginStatus = LOGIN_STATUS[LOGIN_STATUS.BOTH];
    this.genderStatus = GENDER[GENDER.BOTH];
    this.isShowElement = true;
    this.countries = [];
    this.regions = [];
    this.nationalities = [];
  }

  ngOnInit() {
    this.getLocalData();
    this.campaign$.subscribe(c => {
      this.campaign = c;
      this.getCampaignTargetAudienceData();
    });
  }

  ngAfterViewInit() {
    this.form.valueChanges
    .subscribe(values => this.campaignAction.updateState(values));
  }
  ngOnDestroy() {
    this.subscriptionPageSuggestion.unsubscribe();
  }
  /**
   * Target audience data
   */
  private updateCampaign() {
    this.campaignAction.updateState(this.campaign);
  };
  /**
   * get data of target audience
   * when edit campaign
   */
  private getCampaignTargetAudienceData() {
    this.convertToObjectLocation();
    this.convertToPageList();
    this.convertToObjectInterest();
    if (this.campaign.targetAudience.gender) {
      this.genderStatus = this.campaign.targetAudience.gender;
    }

    if (this.campaign.targetAudience.loginStatus) {
      this.loginStatus = this.campaign.targetAudience.loginStatus;
      if (this.loginStatus === LOGIN_STATUS[LOGIN_STATUS.NO]) {
        this.isShowElement = false;
      }
    } else {
      this.loginStatus = this.campaign.targetAudience.loginStatus = LOGIN_STATUS[LOGIN_STATUS.BOTH];
    }

    if (!this.campaign.targetAudience.location) {
      this.campaign.targetAudience.location = CONFIG_VALUE.COUNTRY;
    }
  };
  /**
   * change login status
   * if login status = 'No' then reset gender = null
   */
  public changeLoginStatus() {
    this.campaign.targetAudience.loginStatus = this.loginStatus;
    if (this.loginStatus === LOGIN_STATUS[LOGIN_STATUS.NO]) {
      this.campaign.targetAudience.gender = null;
      this.campaign.targetAudience.nationalities = [];
      this.campaign.targetAudience.ageGroups = [];
      this.campaign.targetAudience.pageIds = [];
      this.pageList = [];
      this.isShowElement = false;
    } else {
      this.isShowElement = true;
      if (!this.campaign.targetAudience.gender) {
        this.campaign.targetAudience.gender = this.genderStatus;
      }
      if (!this.campaign.targetAudience.ageGroups || !this.campaign.targetAudience.ageGroups.length) {
        this.campaign.targetAudience.ageGroups = new Campaign().targetAudience.ageGroups;
      }
    }
  };
  /**
   * change gender and update value to type of number
   *
   */
  public changeGender() {
    this.campaign.targetAudience.gender = this.genderStatus;
  };
  /**
   * Suggestion Location
   */
  /**
   * get all countries, regions and nationalities
   */
  private getLocalData() {
    const pageConfigs = this.localStorageService.retrieve(storageConfigs.page);
    if (pageConfigs && pageConfigs !== null) {
      this.countries = pageConfigs[CONFIG_VALUE.COUNTRY];
      this.regions = pageConfigs [CONFIG_VALUE.REGION];
      this.nationalities = pageConfigs['nationalities'];
    } else {
      this.localStorageService
        .observe(storageConfigs.page)
        .subscribe((data) => {
          this.countries = data[CONFIG_VALUE.COUNTRY];
          this.regions = data[CONFIG_VALUE.REGION];
          this.nationalities = pageConfigs['nationalities'];
        });
    }
    this.appService.fetchInterestConfigs().subscribe((res: any)=>{
      this.interests = getAllInterestNode(res);
    });
  };
  /**
   * change location type to countries or regions
   */
  public changeLocationType() {
    this.locationList = [];
    this.campaign.targetAudience.locations = [];
    this.updateCampaign();
  };
  /**
   * auto complete location
   */
  public onQueryLocation({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    let suggestionResults =[];
    if (this.campaign.targetAudience.location && this.campaign.targetAudience.location === CONFIG_VALUE.REGION) {
      this.regions.forEach(element => {
        if(val && element.names[0].text && element.names[0].text.toLowerCase().match(val.toLowerCase()) !== null) {
          suggestionResults.push(element.names[0].text);
        }
      });
      _updateEvent.next(suggestionResults.slice(0,5).map( (r) => ({name: r})
      ));
    }
    else if (this.campaign.targetAudience.location && this.campaign.targetAudience.location === CONFIG_VALUE.COUNTRY) {
      this.countries.forEach(element => {
        if(val && element.names[0].text && element.names[0].text.toLowerCase().match(val.toLowerCase()) !== null)
          suggestionResults.push(element.names[0].text);
      });
      _updateEvent.next(suggestionResults.slice(0,5).map( (r) => ({name: r})
      ));
    }
  };
  /**
   * remove location item in list
   */
  public onRemoveLocationItem(location: any) {
    if (location && this.locationList) {
      this.locationList =  this.locationList .filter( (item) => {
        return item !== location;
      });
      this.updateLocation();
    }
  };
  /**
   * add  a location item to list
   */
  public onAddLocationItem(newLocation: any) {
    if (newLocation) {
      this.locationList.push(newLocation);
      this.updateLocation();
    }
  };
  /**
   * update location list
   */
  private updateLocation() {
    if (this.locationList.length) {
      this.campaign.targetAudience.locations = this.locationList.map( (item) => {
        return item.name;
      });
    } else {
      this.campaign.targetAudience.locations = [];
    }
    this.updateCampaign();
  };
  /**
   * convert string data from serve to object list
   */
  private convertToObjectLocation() {
    if (this.campaign.targetAudience.locations && this.campaign.targetAudience.locations.length) {
      this.locationList = this.campaign.targetAudience.locations.map ( (item) => {
        return { 'name': item.toString() };
      });
    }
  };


  /**
   * Page Follow
   */
  /**
   * Autocomplete page
   */
  public onQueryPage({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    this.subscriptionPageSuggestion = this.pageService
      .suggest(new PageSuggestionRequest('campaignRecommendManualPage',
        val,
        null,
        null,
        []))
      .subscribe( (listPage) => {
        _updateEvent.next(this.convertToContentRelationship(listPage,'internalUniquePageName'));
      });
  };
  /**
   * convert to page object
   */
  private convertToContentRelationship(listItem: any[], key) {
    const display = 'displayName';
    listItem.map((item, idx, ar) => {
      item[display] = item[key];
      return item;
    });
    return listItem;
  };
  /**
   * add page item to list
   */
  public onAddedPageTag(page: Object) {
    if (page && Object.keys(page).length) {
      this.pageList.push(page);
      this.updatePageList();
    }
  };
  /**
   * remove a page item from list
   */
  public onRemovePageTag(page: Object) {
    if (page && Object.keys(page).length) {
      this.pageList = this.pageList.filter( (item) => {
        return item.entityId !== page['entityId'];
      });
      this.updatePageList();
    }
  };
  /**
   * update page list
   */
  private updatePageList() {
    if (this.pageList.length) {
      this.campaign.targetAudience.pageIds = this.pageList.map((item) => {
        return item['entityId'];
      });
    } else {
      this.campaign.targetAudience.pageIds = [];
    }
    this.updateCampaign();
  };
  /**
   * convert page entityId list to page object list
   */
  private convertToPageList() {
    if(this.campaign.targetAudience.pageIds && this.campaign.targetAudience.pageIds.length) {
      const entityArr = this.campaign.targetAudience.pageIds;
      this.pageService.fetchPageByIds(entityArr)
      .subscribe((result) => {
          this.pageList =
            this.pageList
            .concat(result.map( (model)=> {
              return <any>{
                displayName: model.data.info ? model.data.info.title : '',
                internalUniquePageName: model.data.info ? model.data.info.internalUniquePageName : '',
                entityId: model.entityId
              };
            }
          ));
      });
    }
  };
  /**
   * Intersets session
   *
   */
  /**
   * Autocoplete interest
   */


  onQueryInterest({ val, updateEvent }){
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    this.appService.fetchInterestConfigs().subscribe(x=>{
        const results = getInterestSuggestions(val, x);
        _updateEvent.next(this.convertToContentRelationship(results, 'id'));
    });
  }
  /**
   * add an interest to suggest list
   */
  public onAddedInterest(data: Object) {
    if (data && Object.keys(data).length) {
      this.interestList.push(data);
      this.updateInterestList();
    }
  };
  /**
   * Remove an interest from suggest list
   */
  public onRemoveInterest(data: Object) {
    if (data && Object.keys(data).length) {
      this.interestList = this.interestList.filter( (item) => {
        return item['id'] !== data['id'];
      });
      this.updateInterestList();
    }
  };
  /**
   * Update interestList
   */
  private updateInterestList() {
    if (this.interestList.length) {
      this.campaign.targetAudience.interests = this.interestList.map((item)=> {
        return item.id;
      });
    } else {
      this.campaign.targetAudience.interests = [];
    }
    this.updateCampaign();
  };
  /**
   * Convert string list to object list - interest
   */
  private convertToObjectInterest() {
    if (this.campaign.targetAudience.interests && this.campaign.targetAudience.interests.length) {
      const objList = this.interests.filter( (itemParent) => {
        return this.campaign.targetAudience.interests.filter( (itemChild)=> {
          return itemChild==itemParent.id;
        }).length > 0
      });
      this.interestList = objList;
    }
  };
  /**
   * init select options
   */
  public loginSelectOptions = [
    { value: LOGIN_STATUS[LOGIN_STATUS.YES], text: 'Yes' },
    { value: LOGIN_STATUS[LOGIN_STATUS.NO], text: 'No' },
    { value: LOGIN_STATUS[LOGIN_STATUS.BOTH], text: 'Both' }
  ];
  public genderType = [
    { value: GENDER[GENDER.MALE], text: 'Male' },
    { value: GENDER[GENDER.FEMALE], text: 'Female' },
    { value: GENDER[GENDER.BOTH], text: 'Both' }
  ];
  public locationSelectOption = [
    { text: 'Country', value: CONFIG_VALUE.COUNTRY },
    { text: 'Region', value: CONFIG_VALUE.REGION }
  ];
  /**
   * Age Group
   */
  public ageGroupSelectOptopn = [
    {value: 'all', text: 'All'},
    {value: 'bellow-13', text: 'Bellow 13'},
    {value: '13-18', text: '13-18'},
    {value: '19-24', text: '19-24'},
    {value: '25-34', text: '25-34'},
    {value: '35-44', text: '35-44'},
    {value: '45-54', text: '45-54'},
    {value: '55', text: '55+'}
  ];
}
