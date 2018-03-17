import { CLOUDINARY } from "constant";
import { ImageInfo } from "models";
export type InfoComponentType = "pageGroup" | "profile" | "show";

export class InfoComponentDragDropButton {
  constructor(){
    this.title = '';
    this.type = null;
    this.callback = undefined;
    this.isDisabled = false;
  }

  title: string;
  type: InfoComponentType;
  callback?: Function;
  isDisabled?: boolean;
}



export class InfoComponent {
  constructor() {
    this.entityId = undefined;
    this.type = "pageGroup";
    this.aboveMetadata = true;
    this.data = null;
  }

  entityId?: string;
  type: InfoComponentType;
  aboveMetadata: boolean;
  data: InfoComponentData;
}

export abstract class InfoComponentData {
  constructor(){}
}
