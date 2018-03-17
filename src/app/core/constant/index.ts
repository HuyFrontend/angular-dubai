export const RELATIONSHIP_TYPE = {
  TAG_TO_PAGE: 'tagToPages',
  PUBLISH_ON_BEHALF: 'publishOnBehalf',
  PARAGRAPH: 'paragraph',
  BELONG_TO_PAGE_GROUP: 'belongToPageGroup',
  HAS_IMAGE: 'hasImage',
  HAS_ALBUM: 'hasAlbum'
}

export const PAGE_TYPE = {
  PROFILE: 'profile',
  SPORT_TEAM: 'SPORT_TEAM',
  AUTO_MOBILE: 'AUTO_MOBILE',
  SHOW: 'show',
  EVENTS: 'events',
  BUSINESS: 'business',
  CHARACTERS: 'CHARACTERS',
  SECTION: 'SECTION',
  APP: 'APP',
  AWARD: 'award',
  COMPANY_BUSINESS: 'COMPANY_BUSINESS',
  CHANNEL: 'channel'
};

export const MODERATE_ACTION = {
  APPROVE: 'approve',
  REJECT: 'reject'
}

export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  LIVE: 'live',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDINGLIVE: 'pendingLive',
  PARTIALLIVE: 'partialLive'
};

export const PAGE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  LIVE: 'live',
  UPDATED: 'modified',
  DELETED: 'deleted',
  READY: 'ready',
  INACTIVE: 'inactive',
  PROCESSING: 'processing',
  UNPUBLISH: 'unpublishing'
};

export const CONFIG_VALUE = {
  REGION : 'regions',
  COUNTRY : 'countries',
  CITY : 'cities'
};

export const PAGE_GROUP_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  LIVE: 'live',
  UPDATED: 'modified',
  DELETED: 'deleted',
  READY: 'ready',
  INACTIVE: 'inactive',
  PROCESSING: 'processing',
  UNPUBLISH: 'unpublishing'
};

export const FORM_STATE = {
  PENDING: 'PENDING',
  INVALID: 'INVALID',
  VALID: 'VALID',
  DISABLED: 'DISABLED'
}

export const NOTIFICATION_TYPE = {
  SUCCESS: 'SUCCESS',
  WARNING: 'WARN',
  ERROR: 'ERROR',
  INFO: 'INFO'
};

export const NOTIFICATION_MODE = {
  DEFAULT: 'DEFAULT',
  STICKY: 'STICKY',
  NOTIFY: 'NOTIFY'
}

export const NOTIFICATION_MESSAGE = {
  // tslint:disable-next-line:max-line-length
  CONFIRM_CONTENT_PUBLISH: 'Activating will either put content to pending queue for approval or Live on front end. Do you want to proceed?',
  CONFIRM_PUBLISH: 'The selected item(s) will be published to front page. Do you want to continue?',
  CONFIRM_UNPUBLISH: 'This will be un-published and not shown on Front Office anymore. Do you want to continue?',
  CONFIRM_COPY: 'You have updated some values that are not yet saved. Please save it before copying.',
  CONFIRM_REMOVE: 'Data will be removed. Do you want to continue?',
  CONFIRM_CHANGE_CAMPAIGN_RECOMMENDATION_TYPE: 'The recommendation list will be cleared. Do you want to proceed?',
  CONFIRM_CHANGE_CAMPAIGN_PLACEMENT_MODE: 'Current values will be reset for new values. Do you want to continue?',
  CONFIRM_CANCEL_SCHEDULE: 'Cancellation will put this campaign back to Draft. Do you want to continue?',
  CONFIRM_CLOSE: 'Data will not be saved. Do you want to continue?',
  ALERT_SUCCESS: '{} Successfully',
  ERROR_CAMPAIGN_END_DATE_IN_PAST: 'End Date is in the past. Please adjust End Date before publishing this'
}

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  LIVE: 'live',
  INACTIVE: 'inactive',
  REJECTED: 'rejected',
  UPDATED: 'modified',
  DELETED: 'deleted',
  READY: 'ready',
  PROCESSING: 'processing',
  UNPUBLISH: 'unpublishing',
  CHECKING_MODERATE: 'checkingNeedModerate'
};

export const VIEW_OPTIONS = {
  STANDARD: '0',
  NUMBERED: '1',
  NUMBERED_COUNT_DOWN: '2'
}

export const PARAGRAPH_TYPE = {
    TEXT: 'text',
    IMAGE: 'image',
    EMBEDDED: 'embed',
    LIVE: 'live'
}

export const MOVE_DIRECTION = {
  UP: 'UP',
  DOWN: 'DOWN'
}

export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc'
}

export const CONTENT_TYPE = {
  POST: 'post',
  ARTICLE: 'article',
  PAGE: 'page',
  PAGE_GROUP: 'pageGroup',
  APP: 'app'
}

export const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'ar', name: 'Arabic' }
]

export const SOCIAL_NETWORKS = [
  {name: 'Facebook', displayName: 'Facebook', url: 'facebook.com'},
  {name: 'Twitter', displayName: 'Twitter', url: 'twitter.com'},
  {name: 'Instagram', displayName: 'Instagram', url: 'instagram.com'},
  {name: 'Snapchat', displayName: 'Snapchat', url: 'snapchat.com/add'},
  {name: 'Youtube', displayName: 'Youtube', url: 'youtube.com/user'},
  {name: 'Pinterest', displayName: 'Pinterest', url: 'pinterest.com'},
  {name: 'Vimeo', displayName: 'Vimeo', url: 'vine.co'},
  {name: 'Linkedin', displayName: 'Linkedin', url: 'linkedin.com/in'},
  {name: 'GooglePlus', displayName: 'Google Plus', url: 'plus.google.com'},
  {name: 'Vine', displayName: 'Vine', url: 'vine.co'},
];

export const DATE_SEARCH_RANGES = [
      {value: 'last7Days',text: 'Last 7 Days'},
      {value: 'lastWeek',text: 'Last Week'},
      {value: 'last30Days',text: 'Last 30 Days'},
      {value: 'lastMonth',text: 'Last Month'},
      {value: 'customDate',text: 'Custom Date'}
    ];

export const INPUT_FIELDS = {
  FULL_NAME: 'fullName',
  NICK_NAME: 'playerNickName',
  CLASS: 'class',
  OCCUPATATION: 'occupations',
  ARTISTIC_TITLE: 'title',
  DOB: 'dateOfBirth',
  RIP_DATE: 'ripDate',
  AGE: 'age',
  HIDE_YEAR_AND_AGE: 'hideYearAndAge',
  //PLACE_OF_RESIDENCE: 'placeOfResidence', replace by country and city
  COUNTRY: 'country',
  CITY: 'city',
  NATIONALITY: 'nationalities',
  GENDER: 'gender',
  HOROSCOPE: 'horoscope',
  FULL_REAL_NAME: 'realName',
  SOCIAL_NETWORK: 'socialNetwork',
  ABOUT: 'about',
  WEIGHT: 'weight',
  HEIGHT: 'height',
  VOTING_NUMBER: 'votingNumber',
  SKILL_LEVEL: 'skillLevel',
  ESTABLISHED_YEAR: 'establishedYear',
  SPORT_TEAM: 'sportTeam',
  SPORT_TYPE: 'sportType',
  SPORT_TYPE_MULTI: 'sportTypes',
  MUSIC_TYPE: 'musicType',
  STADIUM_NAME: 'stadiumName',
  STADIUM_GPS: 'stadiumGPS',
  CAPTAIN_NAME: 'captainName',
  COACH_NAME: 'coachName',
};

export const SHOW_INPUT_FIELDS = {
  ARABIC_TITLE: 'arabicTitle',
  ENGLISH_TITLE: 'englishTitle',
  SHOW_LANGUAGE: 'showLanguage',
  DIALECT: 'dialect',
  GENRE: 'genre',
  SUB_GENRE: 'subGenre',
  CENSORSHIP_CLASS: 'censorshipClass',
  SUBTITLING_DUBBING: 'subtitlingDubbing',
  ABOUT: 'about',
  COUNTRY: 'country',
  CITY: 'city',
  STADIUM_NAME: 'stadiumName',
  STADIUM_GPS: 'stadiumGPS',
  LIVE_RECORDED: 'liveRecorded',
  YEAR_DEBUTED: 'yearDebuted',
  SEASON_NUMBER: 'seasonNumber',
  SEQUEL_NUMBER: 'sequelNumber',
  DURATION: 'duration',
  SOCIAL_NETWORK: 'socialNetwork',
  BCM_ID: 'bcmId',
  SHAHID_ID: 'shahidId',
  EXPECTED_RELEASE_DATE: 'expectedReleaseDate',
}

export const CHANNEL_INPUT_FIELDS = {
  CHANNEL_NAME: 'channelName',
  CHANNEL_SHORT_NAME: 'channelShortName',
  REGION_LIST: 'regionList',
  TIMEZONE_LIST: 'timezoneList',
  LANGUAGE: 'language',
  ABOUT: 'about',
  CHANNEL_FREQUENCY: 'channelFrequency',
  GENRE: 'genre',
  SOCIAL_NETWORK: 'socialNetwork',
  RADIO_SCRIPT: 'radioScript',
}

export const EVENTS_INPUT_FIELDS = {
  EVENT_NAME: 'eventName',
  ABOUT_EVENT: 'aboutEvent',
  EVENT_SEASON_TITLE: 'eventSeasonTitle',
  EVENT_SEASON: 'eventSeason',
  EVENT_YEAR: 'eventYear',
  LIVE_RECORDED: 'liveRecorded',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  TIME: 'time',
  COUNTRY: 'country',
  CITY: 'city',
  VENUE_NAME: 'venueName',
  VENUE_SIZE: 'venueSize',
  VENUE_ADDRESS: 'venueAddress',
  EVENT_EMAIL: 'eventEmail',
  EVENT_PHONE: 'eventPhone',
  EVENT_WEBSITE: 'eventWebsite',
  SM_LINK: 'smLink',
  SHAHID_ID: 'shahidId',
}

export const SECTION_INPUT_FIELDS = {
  TITLE: 'title',
  EMAIL: 'email',
  WEBSITE: 'website',
  ABOUT: 'about',
  SOCIAL_NETWORK: 'socialNetwork',
}

export const BUSINESS_INPUT_FIELDS = {
  NAME: 'name',
  FOUNDED: 'founded',
  COUNTRY: 'country',
  CITY: 'city',
  INDUSTRY: 'industry',
  SUB_INDUSTRY: 'subIndustry',
  SOCIAL_NETWORK: 'socialNetwork',
  HQ_COUNTRY: 'hqCountry',
  COMPANY_WEBSITE: 'companyWebsite',
  ABOUT: 'about',
}

export const AWARD_INPUT_FIELDS = {
  TITLE: 'title',
  ABOUT: 'about',
  CATEGORY: 'category',
}

export const WORKFLOW_TASK = {
    ACTIVE_ENTITY : 'activateEntity',
    UNPUBLISH_ENTITY : 'unpublishEntity',
    MODERATE_ENTITY : 'moderateEntity',
    DELETE_ENTITY : 'deleteEntity'
}

export const PUBLISHING_LEVEL = {
  LEVEL2: 2,
  LEVEL3: 3,
  LEVEL4: 4
}

export const SUB_TYPES = {
  // Profile
  STAR: 'star',
  SPORT_PLAYER: 'sportPlayer',
  GUEST: 'guest',
  TALENT: 'talent',
  SPORT_TEAM: 'sportTeam',
  BAND: 'band',
  // Show
  MOVIES: 'movie',
  SERIES: 'series',
  PROGRAM: 'program',
  NEWS: 'news',
  MATCH: 'match',
  PLAY: 'play',
  // Channel
  TV_CHANNEL: 'tvChannel',
  RADIO_CHANNEL: 'radioChannel',
  // Events
  AWARD_CEREMONY: 'awardCeremony',
  CONCERT: 'concert',
  CAR_SHOW: 'carShow',
  EXTREME_SPORTS: 'extremeSports',
  SPORT_EVENT: 'sportEvent',
  CRS: 'crs',
  OPENING_CEREMONY: 'openingCeremony',
  PRESS_CONFERENCE: 'pressConference',
  THEME_PARTY: 'themeParty',
  CHILDREN_SHOW: 'childrenShow',
  SEMINAR_AND_CONFERENCE: 'seminarAndConference',
  BIRTHDAY: 'birthday',
  NETWORKING_EVENT: 'networkingEvent',
  PRODUCT_LAUNCH: 'productLaunch',
  WEDDING: 'wedding',
  WEDDING_ANNIVERSARY: 'weddingAnniversary',
  TRADE_SHOWS: 'tradeShows',
}

export const CLOUDINARY = {
  PROTOCOL: 'https://',
  DOMAIN: 'res.cloudinary.com',
  CLOUD_NAME: 'mbc-net',
  FOLDER: 'image/upload',
  API_URL: 'api.cloudinary.com/v1_1/',
  API_KEY: '875533594619936',
  API_SECRECT: 'nbl3PHj2W2fsR53G7oZR47d_NlA',
  UPLOAD_PRESET: 'general_unsigned',
  DUMMY_IMAGE: {
    PUBLIC_ID: 'gray_placeholder',
    FILE_TYPE: 'jpg',
    VERSION: 1507101111,
    WIDTH: 210
  },
  ALLOWED_FORMAT_TYPES: ['png', 'jpg', 'jpeg', 'gif'],
  MIN_FILE_SIZE: 0,
  MAX_FILE_SIZE: 10 * 1024 * 1024 //10 MB
}

export const CAMPAIGN_RESULT_TYPE = {
  CONTENT: 'CONTENT',
  PAGE: 'PAGE'
}

export const CAMPAIGN_RESULT_MODE = {
  MANUAL: 'MANUAL',
  DYNAMIC: 'DYNAMIC'
}

export const CAMPAIGN_PLACEMENT_MODE = {
    STREAM_CARD: 'stream_card',
    LISTING: 'listing'
}

export const CAMPAIGN_PLACEMENT_DESTINATION = {
  NEWS_FEED: 'newsfeed',
  VIDEO: 'video'
}


export const CAMPAIGN_RECOMMENDATION_TARGET = {
    PAGE: 'page',
    CONTENT: 'content',
    APP: 'app'
}

export const SUGGESTION_TYPE = {
    PAGE_CAMPAIGN_RECOMMEND: 'campaignRecommendManualPage',
    CONTENT_CAMPAIGN: 'contentInCampaign',
    APP_RECOMMENDATION:'appRecommendation'
}

export enum LOGIN_STATUS { YES = 1, NO = 2, BOTH = 0 };
export enum GENDER { MALE = 1, FEMALE = 2, BOTH = 0 };

export const PAGE_METADATA_FIELD = {
  ABOUT: 'About',
  AGE: 'Age',
  CAPTAIN_NAME: 'Captain Name',
  CITY: 'City',
  CLASS: 'Star Class',
  COACH_NAME: 'Coach Name',
  COUNTRY: 'Place of Resident',
  DATE_OF_BIRTH: 'Date Of Birth',
  ESTABLISHED_YEAR: 'Established Year',
  FULL_NAME: 'Full Name',
  GENDER: 'Gender',
  HEIGHT: 'Height',
  HIDE_YEAR_AND_AGE: 'Hide Year And Age',
  HOROSCOPE: 'Horoscope',
  MUSIC_TYPE: 'Music Type',
  NATIONALITIES: 'Nationality',
  OCCUPATIONS: 'Occupations',
  PLAYER_NICK_NAME: 'Player Nick Name',
  REAL_NAME: 'Full Real Name',
  RIP_DATE: 'RIP Date',
  SKILL_LEVEL: 'Skill Level',
  SOCIAL_NETWORK: 'Social Media',
  SPORT_TEAM: 'Sport Team',
  SPORT_TYPE: 'Sport Type',
  SPORT_TYPES: 'Sport Types',
  STADIUM_GPS: 'Stadium Address - GPS Location',
  STADIUM_NAME: 'Stadium Name',
  TITLE: 'Title',
  VOTING_NUMBER: 'Voting Number',
  WEIGHT: 'Weight',

  TITLE_ARABIC: 'Arabic Title',
  TITLE_ENGLISH: 'English Title',
  SHOW_LANGUAGE: 'Original Language',
  DIALECT: 'Dialect',
  GENRE: 'Genre',
  SUBGENRE: 'Subgenre',
  CENSORSHIP_CLASS: 'Censorship Class',
  SUBTITLING_AND_DUBBING: 'Subtitling and Dubbing',
  LIVE_RECORDED: 'Live Recorded',
  YEAR_DEBUTED: 'Year Debuted',
  SEASON_NUMBER: 'Season Number',
  SEQUEL_NUMBER: 'Sequel Number',
  DURATION: 'Duration',
  BCM_ID: 'BCM ID',
  SHAHID_ID: 'Shahid ID',
  EXPECTED_RELEASE_DATE: 'Expected Release Date',

  EVENT_NAME: 'Event Name',
  ABOUT_EVENT: 'About Event',
  EVENT_SEASON_TITLE: 'Event Season Title',
  EVENT_SEASON: 'Event Season',
  EVENT_YEAR: 'Event Year',
  START_DATE: 'Start Date',
  END_DATE: 'End Date',
  TIME: 'Time',
  VENUE_NAME: 'Venue Name',
  VENUE_SIZE: 'Venue Size',
  VENUE_ADDRESS: 'Venue Address',
  EVENT_EMAIL: 'Event Email',
  EVENT_PHONE: 'Event Phone',
  EVENT_WEBSITE: 'Event Website',
  SM_LINK: 'SM Link',

  CHANNEL_NAME: 'Channel Name',
  CHANNEL_SHORT_NAME: 'Channel Short Name',
  REGION_LIST: 'Region List',
  TIMEZONE_LIST: 'Timezone List',
  LANGUAGE: 'Language',
  CHANNEL_FREQUENCY: 'Channel Frequency',
  RADIO_SCRIPT: 'Radio Script',

  NAME: 'Name',
  FOUNDED: 'Founded',
  INDUSTRY: 'industry',
  SUB_INDUSTRY: 'Sub Industry',
  HQ_COUNTRY: 'HQ Country',
  COMPANY_WEBSITE: 'Company Website',
  CATEGORY: 'Category',

  NICK_NAME: 'Player Nick Name',
  OCCUPATATION: 'Occupations',
  ARTISTIC_TITLE: 'Title',
  NATIONALITY: 'Nationalities',
  FULL_REAL_NAME: 'Real Name',

  STADIUM: 'Stadium',
  STADIUM_ADDRESS: 'Stadium Address',
  TEAM_NICK_NAME: 'Team Nick Name',
  YEAR_ESTABLISHED: 'Year Established',
  SPORT_TEAM_TYPE: 'Sport Team Type',
  TEAM_CAPTAIN_NAME: 'Team Captain Name'
}

export const APP_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  LIVE: 'live',
  INACTIVE: 'inactive',
  REJECTED: 'rejected',
  UPDATED: 'modified',
  DELETED: 'deleted',
  PROCESSING: 'processing',
  UNPUBLISH: 'unpublishing'
};

export const INFO_COMPONENT_FIELD = {
  LINKED_ITEM_2: {
    METADATA: 'Whose metadata includes',
    CHARACTER: 'Character'
  }
}
