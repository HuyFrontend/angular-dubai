import { PAGE_STATUS } from 'constant';
import { ImageInfo } from 'models/image-info.model'

export class PageInfo {

    constructor() {
        this.language = 'ar';
        this.customURL = '';
        this.website = 'www.mbc.net';
        this.geoTargeting = '';
        this.geoSuggestions = [];
    }
    type: string;

    language: string;

    internalUniquePageName: string;

    coverThumbnail: string;

    posterThumbnail: string;

    logoThumbnail: string;

    title: string;

    customURL: string;

    website: string;

    // optional
    geoSuggestions: string[];

    geoTargeting: string;

    logoURL: ImageInfo;

    posterURL: ImageInfo;

    coverURL: ImageInfo;
}

export class PageSetting {
    constructor() {
        this.showMenuTabs = true;
        this.showContentBundles = true;
        this.hidePageTabs = [];
        this.featureOnMainMenu = [];
        this.selectLandingTab = 'newsfeed';
        this.allowUsersFollowPage = true;
        this.allowUsersWritePageFanHub = true;
        this.allowUsersSearch = true;
        this.hide = false;
        this.enableInstantPublishing = false;
        this.allowTag = true;
        this.enableEditorialApprovalWorkflow = true;
        this.searchable = true;
        this.accentColor = '';
        this.headerColor = '';
    }
    showMenuTabs: boolean;

    showContentBundles: boolean;

    hidePageTabs: string[];

    featureOnMainMenu: string[];

    selectLandingTab: string;

    allowUsersFollowPage: boolean;

    allowUsersWritePageFanHub: boolean;

    allowUsersSearch: boolean;

    hide: boolean;

    enableInstantPublishing: boolean;

    allowTag: boolean;

    enableEditorialApprovalWorkflow: boolean;

    searchable: boolean;

    accentColor: string;

    headerColor: string;
}

export class ProfileSubType {
  constructor() {
    this.fullName = '';
    this.class = '';
    this.playerNickName = '';
    this.socialNetwork = [];
    this.occupations = [];
    this.title = '';
    this.age = 0;
    this.hideYearAndAge = false;
    this.realName = '';
    this.country = '';
    this.city = '';
    this.nationalities = [];
    this.gender = 'male';
    this.horoscope  = '';
    this.about = '';
    this.ripDate = null;
    this.dateOfBirth = null;
    this.skillLevel = '';
    this.sportTeam = 'nationalTeam';
    this.sportType = '';
    this.sportTypes = [];
    this.establishedYear = null;
    this.musicType = '';
  }
  fullName: string;
  class: string;
  occupations: string[];
  title: string;
  dateOfBirth: string;
  ripDate: string;
  age: number;
  hideYearAndAge: boolean;
  country: string;
  city: string;
  nationalities: string[];
  gender: string;
  skillLevel: string;
  sportTeam: string;
  sportType: string;
  sportTypes: string[];
  votingNumber: number;
  establishedYear: string;
  musicType: string;
  // optional
  horoscope: string;
  // optional
  realName: string;
  socialNetwork: any[];
  // optional
  about: string;
  playerNickName: string;
  weight: number;
  height: number;
  stadiumName: string;
  stadiumGPS: string;
  captainName: string;
  coachName: string;
}

export class ShowSubType {
  constructor() {
    this.arabicTitle = '';
    this.englishTitle = '';
    this.showLanguage = '';
    this.genre = '';
    this.subGenre = [];
    this.about = '';
    this.country = '';
    this.stadiumName = '';
    this.censorshipClass = '';
    this.subtitlingDubbing = '';
  }

  arabicTitle: string;
  englishTitle: string;
  showLanguage: string;
  dialect: string;
  genre: string;
  subGenre: string[];
  censorshipClass: string;
  subtitlingDubbing: string;
  about: string;
  country: string;
  city: string[];
  stadiumName: string;
  stadiumGPS: string;
  liveRecorded: string;
  yearDebuted: string;
  seasonNumber: string;
  sequelNumber: string;
  duration: string;
  socialNetwork: any[];
  bcmId: string;
  shahidId: string;
  expectedReleaseDate: string;
}

export class ChannelSubType {
  constructor() {
    this.channelName = '';
    this.channelShortName = '';
    this.regionList = [];
    this.timezoneList = [];
    this.language = [];
    this.about = '';
    this.channelFrequency = '';
    this.genre = '';
    this.bcmId = '';
    this.radioScript = '';
  }

  channelName: string;
  channelShortName: string;
  regionList: string[];
  timezoneList: string[];
  language: string[];
  about: string;
  channelFrequency: string;
  genre: string;
  socialNetwork: any[];
  bcmId: string;
  radioScript: string;
}

export class EventsSubType {
  constructor() {
    this.eventType = '';
    this.liveRecorded = 'live';
  }

  eventType: string;
  eventName: string;
  aboutEvent: string;
  eventSeasonTitle: string;
  eventSeason: string;
  eventYear: string;
  liveRecorded: string;
  startDate: string;
  endDate: string;
  time: string;
  country: string;
  city: string;
  venueName: string;
  venueSize: string;
  venueAddress: string;
  eventEmail: string;
  eventPhone: string;
  eventWebsite: string;
  smLink: string;
  shahidId: string;
}

export class SectionSubType {
  constructor() {
    this.title = '';
    this.about = '';
  }

  title: string;
  email: string;
  website: string;
  about: string;
  socialNetwork: any[];
}

export class BusinessSubType {
  constructor() {
    this.name = '';
    this.founded = '';
    this.country = '';
    this.city = '';
    this.industry = '';
    this.subIndustry = '';
    this.hqCountry = '';
    this.about = '';
  }

  name: string;
  founded: string;
  country: string;
  city: string;
  industry: string;
  subIndustry: string;
  socialNetwork: any[];
  hqCountry: string;
  about: string;
  companyWebsite: string;
}

export class AwardSubType {
  constructor() {
    this.title = '';
    this.about = '';
    this.category = '';
  }

  title: string;
  about: string;
  category: string;
}

export class PageMeta {
  constructor(type:string = 'profile') {
    this.pageSubType = '';
    this.switchType(type);
  }

  switchType(type: string): void {
    if (type === 'show') {
      this.pageSubTypeData = new ShowSubType();
    } else {
      this.pageSubTypeData = new ProfileSubType();
    }
  }

  fullName: string;

  pageSubType: string;
  pageSubTypeData?: any;
}

export class PageGroup {
    relationshipId: string;
    pageGroupId: string;
    pageGroupName: string;
    status: string;
}

/**
 * page info component model and its submodel
 */
export class LinkedData {
  metadata: string[];
  isShow?: boolean;
  page: {entityId?: string, displayName: string};
  formatList?: any;
  pageInfo?: any;

  constructor(obj?: {metadata?: string[], isShow?: boolean, page?: any, formatList?: any, pageInfo?: any}) {
    this.metadata = obj && obj.metadata || [];
    this.isShow = obj && obj.isShow || true;
    this.page = obj && obj.page || {};
    this.formatList = obj && obj.formatList || [];
    this.pageInfo = obj && obj.pageInfo || {};
  }
}
export class InfoPageGroup {
  label: string;
  showDataOnStream: boolean;
  linkedData: LinkedData[];
  pageGroup: {entityId?: string, displayName: string};

  constructor(obj?: {label?: string, showDataOnStream?: boolean, linkedData?: LinkedData[], pageGroup: any}) {
    this.label = obj && obj.label || '';
    this.showDataOnStream = obj && obj.showDataOnStream || false;
    this.linkedData = obj && obj.linkedData || [];
    this.pageGroup = obj && obj.pageGroup || {};
  }
}

export class InfoComponent {
  type: string;
  aboveMetadata: boolean;
  data: any;
  constructor(obj?: {type?: string, aboveMetadata?: boolean, data?: any}) {
    this.type = obj && obj.type || '';
    this.aboveMetadata = obj && obj.aboveMetadata || true;
    this.data = obj && obj.data || null;
  }
}
/**
 * Page Model
 */
export class PageModel {
    constructor() {
        this.info = new PageInfo();
        this.settings = new PageSetting();
        this.meta = new PageMeta();
        this.pageGroup = new PageGroup();
        this.infoComponents = undefined;
    }

    entityId: string;

    status: string;

    info: PageInfo;

    settings: PageSetting;

    meta: PageMeta;

    checked: boolean;

    publishedDate: any;

    actions: any;

    body: any;

    pageGroup: PageGroup;

    infoComponents: InfoComponent[];

}

export class PageSuggestionRequest {
  constructor(type: string, suggestValue: string, pageType?: string, pageSubType?: string, excludeIds?: string[], excludedStatus?: string[]){
    this.type = type;
    this.suggestValue = suggestValue;
    this.pageType = pageType;
    this.pageSubType = pageSubType;
    this.excludedIds = excludeIds;
    this.excludedStatus = excludedStatus;
  }

  type: string;
  suggestValue: string;
  pageType?: string;
  pageSubType?: string;
  excludedStatus: string[];
  excludedIds?: string[];
}
