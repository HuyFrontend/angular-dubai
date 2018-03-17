import {SORT_DIRECTION} from 'constant';
export * from './storage';
export * from './environment';
export * from './state-helper';
export * from './date-helpers';
export * from './embedded-iframe';
export * from './paragraph-helper';
export * from './config-helper';
export * from './formatters';
export * from './embed-code.helper';
export * from './number.utils';

export const swapItem = (arr: any[], firstIdx: number, secondIdx: number) => {
    const firstItem = {
        ...arr[firstIdx]
    };

    const secondItem = {
        ...arr[secondIdx]
    };
    arr[firstIdx] = secondItem;
    arr[secondIdx] = firstItem;
    return [
        ...arr
    ];
}

export const sortByOrder = (arr: any[]) => {
    let paragraphs = [ ...arr.sort(compareOrder)];
    paragraphs.forEach((item, idx) => {
        item.order = idx;
    });
    return paragraphs;
}

export const compareOrder = (a:any,b:any) => {
  if (a.order < b.order)
    return -1;
  if (a.order > b.order)
    return 1;
  return 0;
}

export const sortByAnyField = (arr: any[], field:string, direction: string) => {
    let sortDirection = 1;
    if(direction == SORT_DIRECTION.DESC){
        sortDirection = -1;
    }
    return arr.sort((first, second) => {
            if (first[field] < second[field])
                return -1*sortDirection;
            if (first[field] > second[field])
                return 1*sortDirection;
            return 0;
    });
}

export const getQueryParameter = (router:any, parameter:string)=>{
    return router.currentUrlTree.queryParams[parameter];
}
