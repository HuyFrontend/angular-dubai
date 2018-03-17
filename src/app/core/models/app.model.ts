import { EntityStatus } from 'models/entity.model';
import { ContentRelationship, ImageInfo, EntityRequest } from 'models';
import { AppInfo, AppOptions } from 'models/app';
export class App {

  constructor(obj?: any) {
    this.info = obj && obj.data || new AppInfo();
    this.options = obj && obj.data || new AppOptions();
  }
  checked: boolean;
  info: AppInfo;
  photo: ImageInfo;
  options: AppOptions;
  generalType: string = "app"

  static convertToEntity(app: App): any {
    let entity = new EntityRequest();

    entity.entityId = app.info.id ? app.info.id : '';
    entity.type = app.generalType;

    const data: any = {}
    Object.keys(app.info).forEach(key => {
        if (app.info[key] != null && app.info[key]) {
          if (key === 'publishOnBehalf')
            data[key] = app.info[key].entityId;
          else if (key === 'tagToPages') {
            let tagPagesIds = [];
            app.info[key].forEach(page => tagPagesIds.push(page.entityId));
            data[key] = tagPagesIds;
          }
          else
            data[key] = app.info[key];
        }
    });

    Object.keys(app.options).forEach(key => {
       data[key] = app.options[key];
    });

    data["photo"] = app.photo;

    entity.data = data;
    return entity;
  }
}
