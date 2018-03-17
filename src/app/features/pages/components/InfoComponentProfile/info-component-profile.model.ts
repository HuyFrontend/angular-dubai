import { InfoComponent, InfoComponentData, InfoComponentType } from '../pageTabInfoComponents/page-tab-infocomponents.model';

export class InfoComponentProfileData extends InfoComponentData {
    constructor() {
      super();
      this.pageType = undefined;
      this.pageSubType = undefined;
      this.title = undefined;
      this.showDataOnStream = false;
      this.linkDataBOList = [];
    }

    pageType: string;
    pageSubType: string;
    title: string;
    showDataOnStream: boolean;
    linkDataBOList: Array<ProfileLinkedData>;
}


export class ProfileLinkedData {
  constructor(entityId: string, linkedItem1: LinkedItem, linkedItem2: LinkedItem){
    this.entityId = entityId;
    this.linkedItem1 = linkedItem1;
    this.linkedItem2 = linkedItem2;
  }

  entityId: string;
  linkedItem1: LinkedItem;
  linkedItem2: LinkedItem;

  _props?: any

  getValue(): ProfileLinkedData{
    return new ProfileLinkedData(this.entityId, this.linkedItem1, this.linkedItem2);
  }
}


export class ProfileLinkedDataVO {
  profileLinked: ProfileLinkedData;
  props: {};

}

export class LinkedItem {
  constructor(page1, page2, linkType, linkProperties) {
    this.page1 = page1;
    this.page2 = page2;
    this.linkType = linkType;
    this.linkProperties = linkProperties  || new LinkedProperty();
  }

  page1?: Page;
  page2?: Page;
  linkType: string;
  linkProperties?: LinkedProperty;
}

export class LinkedProperty {
  constructor(){
    this.metadata = [];
  }

  metadata: Array<any>;
}

export class Page {
  constructor(entityId: string, displayName: string){
    this.entityId = entityId;
    this.displayName = displayName;
  }
  entityId: string;
  displayName: string;
}
