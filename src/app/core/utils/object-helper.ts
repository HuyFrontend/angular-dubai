import * as objectMapper from 'object-mapper';

export class ObjectHelper {
  public static cloneWithProperties(...args): any {
    let obj = {},
        numParams: number = arguments.length;

    if (numParams === 2) {
      obj = objectMapper(arguments[0], arguments[1]);
    } else if (numParams > 2) {
      obj = objectMapper(arguments[0], this.getMapObject(arguments[1], arguments[2]));
    }

    return obj;
  };

  private static getMapObject(mapFrom: string[], mapTo: string[]): any {
    let mapObj = {},
        index = 0;

    mapFrom.map(prob => {
      mapObj[prob] = mapTo[index];
      index++;
    });

    return mapObj;
  }
};
