export class CloudinarySearchCriteria {
    constructor(){
        this.with_field = "context";
        this.max_results = 9;
        this.next_cursor = "";
        this.expression = "";
    }

    with_field: string;
    max_results: number;
    next_cursor: string;
    expression: string;
    // Ex: context.page:test
}
