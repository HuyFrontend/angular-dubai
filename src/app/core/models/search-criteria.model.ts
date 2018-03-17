export class SearchCriteria {
    constructor(){
        this.field = '';
        this.keywords= [],
        this.orderBy= '',
        this.orderDir= 'sorting_desc',
        this.page= 0,
        this.quickSearchValue= '',
        this.pageSize = 20,
        this.fromDate = '',
        this.toDate = ''
        }
    type: string;
    field: string;
    keywords: string[];
    orderBy: string;
    orderDir: string;
    page: number;
    quickSearchValue: string;
    fromDate: string;
    toDate: string;
    pageSize: number;
}
