import { Pipe, PipeTransform } from '@angular/core';
import { PAGE_STATUS } from 'constant';

const TransformType = {
    C: 'C', // CAPITAL
    UC: 'UC', // UPPERCASE
    LC: 'LC' // LOWERCASE
};

const transformFuncs = {
    [TransformType.C]: (val) => val.charAt(0).toUpperCase() + val.slice(1),
    [TransformType.UC]: (val) => val.toUpperCase(),
    [TransformType.LC]: (val) => val.toLowerCase(),
}

/**
 * Transform 'PageStatus' to display in UI.
 * 
 * @export
 * @class PageStatusPipe
 * @implements {PipeTransform}
 */
@Pipe({
    name: 'pageStatus'
})

export class PageStatusPipe implements PipeTransform {
    readonly defaultVal: string = '';

    /**
     * Tranform from status to data that display in UI.
     * 
     * @param {*} val
     * @param {string} type
     * @returns {*}
     * 
     * @memberOf PageStatusPipe
     */
    transform(val: any, type: string = TransformType.C): string {
        let returnVal: string = this.defaultVal;

        if (!TransformType[type]) throw 'TransformType is wrong!';

        if (val && typeof val === 'string') {
            returnVal = transformFuncs[type](val);
        }
        return returnVal;
    }
}