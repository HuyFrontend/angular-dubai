import { Pipe, PipeTransform } from '@angular/core';


const convertByLang = (names: any[], lang: string): string => {
    if (names) {
        const nameByLang = names.find(x=> x.locale == lang);
        return nameByLang['text'];
    }
}

/**
 * Transform 'PageTypes' to display in UI.
 * 
 * @export
 * @class PageTypeByLangPipe
 * @implements {PipeTransform}
 */
@Pipe({
    name: 'pageTypeByLang'
})

export class PageTypeByLangPipe implements PipeTransform {
    readonly defaultLang: string = 'en';
    
    /**
     * 
     * 
     * @param {*} val
     * @param {string} type
     * @returns {*}
     * 
     * @memberOf PageTypeByLangPipe
     */
    transform(names: any[], lang?: string): string {
        const inputtedLang = lang ? lang : this.defaultLang;

        return convertByLang(names, inputtedLang);
    }
}