const localStorage: any = window.localStorage;

/**
 * name
 */
export class Storage {
    static set(key: string, val: any) {
        let current = localStorage.getItem(key);

        if(!current) localStorage.removeItem(key);

        localStorage.setItem(key, JSON.stringify(val));
    }
    static get(key: string) {
        try {
            let obj = localStorage.getItem(key);
            if(obj) {
                return JSON.parse(obj);
            }
        } catch (err) {
            throw err;
        }
    }
    static remove(key: string) {
        let item = localStorage.getItem(key);

        if(item) localStorage.removeItem(key);
    }
}
