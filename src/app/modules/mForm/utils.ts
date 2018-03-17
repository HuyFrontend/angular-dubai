import {
    ElementRef
} from '@angular/core';

function toogleDisplay(el: ElementRef, isDisplay: boolean): void {
    el.nativeElement.style.display = isDisplay ? 'block' : 'none';
}

function getValueByPath(root: any, fieldPath: string) {
    const arrPath = fieldPath.indexOf('.') !== -1 ? fieldPath.split('.') : [fieldPath];
    let returnObj = {};
    for (let idx = 0; idx < arrPath.length; idx++) {
        if(idx > 0 && !returnObj[arrPath[idx]]) {
            returnObj = undefined;
            break;
        }
        returnObj = idx === 0 ? root[arrPath[idx]] : returnObj[arrPath[idx]];
    }
    return returnObj;
}

export {
    getValueByPath,
    toogleDisplay
}