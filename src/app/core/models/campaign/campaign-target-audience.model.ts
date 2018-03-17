import { LOGIN_STATUS, GENDER } from 'constant';
export class CampaignTargetAudience {
  loginStatus: string;
  gender: string;
  segmentSize: number;
  location: string;
  locations: string[];
  nationalities: string[];
  ageGroups: string[];
  interests: string[];
  pageIds: string[];

  constructor(obj?: any) {
    this.loginStatus = obj && obj.loginStatus || LOGIN_STATUS[LOGIN_STATUS.BOTH];
    this.gender = obj && obj.gender || GENDER[GENDER.BOTH];
    this.segmentSize = obj && obj.segmentSize || 0;
    this.location = obj && obj.location || 'countries';
    this.locations = obj && obj.locations || [];
    this.nationalities = obj && obj.nationalities || [];
    this.ageGroups = obj && obj.ageGroups || ['all'];
    this.interests = obj && obj.interests || [];
    this.pageIds = obj && obj.pagesId || [];
  }
}
