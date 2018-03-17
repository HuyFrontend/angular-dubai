# Component path
```
/Volumes/DATA/MBC/bo-app/src/app/components/
```

# Table component
```
/Volumes/DATA/MBC/bo-app/src/app/components/dataTable
```

```html
<data-table [records]="pages" (loadMore)="loadMore($event)" (sort)="sort($event)" [loading]="loading" [has-more]="hasMore" [dragable]="true" (movedItemsHandler)="movedItemsHandler($event)">
        <header title="Internal Page name" name="data.info.title"></header>
        <header title="Page Image" name="data.info.logoURL" [sortable]="false"></header>
        <header title="Type" name="data.info.type"></header>
        <header title="Publish Date" name="publishedDate"></header>
        <header title="Status"></header>

        <column value="data.info.title" type="link" [getLink]="getDetailUrl"></column>
        <column value="data.info.logoURL" type="image" imageUrl="imageUrl"></column>
        <column value="data.info.type"></column>
        <column value="publishedDate" [formatter]="dateFormatter"></column>
        <column value="status" type="status"></column>

        <table-action name="publish" title="Publish" (doAction)="publishAPage($event)" [condition]="showPublishCondition"></table-action>
        <table-action name="edit" title="Edit" (doAction)="editPage($event)"></table-action>
      </data-table>
```

[dragable]="true":  If you want your table is able to drag and drop.
movedItemsHandler($event):  the $event object contains all effected items 

# Common form field
```
/Volumes/DATA/MBC/bo-app/src/app/components/form/controls
```

## Input field
```html
<text-input [(ngModel)]="campaign.title" name="title" required
    title="*Campaign Name"
    placeholder="Enter campaign name here">
</text-input>
```

## Select field (dropdown)
```html
<select-input [(ngModel)]="campaign.country" name="country" required
    title="*Country Name"
    placeholder="Select a country here">
    <option [value]="1">Option One</option>
    <option [value]="2">Option Two</option>
</select-input>
```

## Calendar (date time picker)
```html
<calendar [(ngModel)]="campaign.startDate" name="startDate" required 
    title="*Start Date" 
    placeholder="Enter campaign start date here">
</calendar>
```

## Checkbox
```html
<checkbox [(ngModel)]="campaign.noEndDate"
    name="noEndDate"
    title="No End Date">
</checkbox>   
```