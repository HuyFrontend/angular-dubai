import { Component, OnInit, Input, ViewEncapsulation,
        OnChanges, SimpleChanges,ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { select } from '@angular-redux/store';

import { ParagraphImage, ImageInfo, PageSuggestionRequest } from 'models';
import { PageService } from 'services';
import { ContentActions, FormActions } from 'state';
import { FORM_STATE } from 'constant';
import { ParagraphHelper } from 'utils';

@Component({
    selector: 'image-paragraph',
    templateUrl: 'image-paragraph.html',
    styleUrls: ['image-paragraph.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ImageParagraphComponent implements OnInit, OnChanges {
    @Input('parent-form-group') parentFormGroup: FormGroup;
    @Input('show-title') showTitle: boolean = true;
    @Input('show-label') showLabel: boolean = true;
    @Input('autosave') autosave: boolean = true;
    @Input() paragraph: ParagraphImage;
    @Input() idx: number;
    @Input() isFormSubmitted: boolean;
    @Input() isReadOnly: boolean = false;
    @ViewChild('quillEditor') private quillEditor: any;

    public listSelectedPages: any[];
    public imageOptions: object;
    public quill: any;
    public isMetadataEnable: boolean = true;

    constructor(
        private formActions: FormActions,
        private contentActions: ContentActions,
        private pageService: PageService) {
            this.listSelectedPages = [];
            this.imageOptions = { isRequired: true, isCollapsable: false};
        }

    ngOnInit() {
        this.isMetadataEnable = !!this.parentFormGroup.controls.image.value;
    }

    ngOnChanges(changes: SimpleChanges) {
        const { paragraph } = changes;
        if(paragraph) {
            if(this.paragraph) {
                this.listSelectedPages = this.paragraph.tagToPages;
            }
        }
        if (changes.isReadOnly) {
            this.quill && this.quill.enable(!changes.isReadOnly.currentValue);
        }
    }

    ngAfterViewInit(){
        ParagraphHelper.clearStyleOnCopy(this.quillEditor.quill);
        this.quill = this.quillEditor.quill;
        this.quill.enable(this.isMetadataEnable);
        this.isReadOnly && this.quill.enable(false);
    }

    convertToContentRelationship(listItem: any[], key) {
        const display = 'displayName';
        listItem.map((item, idx, ar) => {
            item[display] = item[key];
            return item;
        });
        return listItem;
    }

     /**
     * Query all page matched parameters then fill to control.
     *
     * @param {any} { val: string, updateEvent: BehaviorSubject<any> }
     *
     * @memberOf ArticleFormComponent
     */
    onQueryTagToPages({ val, updateEvent }) {
        const _updateEvent: BehaviorSubject<any> = updateEvent;

        this.pageService
            .suggest(new PageSuggestionRequest('tag', val))
            .subscribe(listPage => {
                _updateEvent.next(this.convertToContentRelationship(listPage, 'internalUniquePageName'));
            });
    }
    /**
     * Remove relationship between PageToTag and Article.
     *
     * @param {*} data
     *
     * @memberOf ArticleFormComponent
     */
    onRemovePageTag(data: any) {
        if (data && this.autosave) {
            data.parentPath = 'paragraphs';
            this.contentActions.removeTag2PageOfParagraph(data, this.idx);
        }
    }

    /**
     * Request to create relationship
     *
     * @param {*} page
     *
     * @memberOf ImageParagraphComponent
     */
    onAddedTagToPage(page: any) {
        if (page && this.autosave) {
            // check if articleId is not avaiable then add to queue for later task.
            page.parentPath = 'paragraphs';
            if(this.paragraph.entityId) {
                page.idx = this.idx;
                this.contentActions
                    .createRelationship(
                        this.paragraph.entityId,
                        'tagToPages',
                        page,
                        {
                            order: this.paragraph.order
                        })
                    .subscribe(relationshipId => {
                        page.relationshipId = relationshipId;
                    });
            }else {
                this.contentActions.addInQueue('tagToPages', page);
            }
        }
    }

    onTextParagraphChanged(e: any) {
        const { htmlValue } = e;
        const id = this.paragraph ? this.paragraph.entityId : 0;
        const status = this.parentFormGroup.controls.image.hasError('required') ? FORM_STATE.INVALID : FORM_STATE.VALID;
        this.contentActions.updateFormGroupStatus(
            `paragraph_${id}`,
            status
        )

        if(htmlValue){
          this.updateDescriptionVal(htmlValue);
        }

        if(this.autosave && FORM_STATE.VALID === status) {
                this.contentActions
                    .saveParagraphEntity(false, this.paragraph.entityId)
                    .subscribe();
        }
    }

    updateDescriptionVal(description: string) {
        this.formActions.updateFormArrayByIdx('paragraphs', this.idx, {
            propertyKey: 'description',
            propertyValue: description,
            propertyState: undefined
        });
    }

    updateValueAndValidity() {
        this.parentFormGroup.controls.image.updateValueAndValidity();
    }

    onImageChange(formControl: AbstractControl, imageInfo: ImageInfo){
        formControl.setValue(imageInfo);
        this.isMetadataEnable = !!imageInfo;
        this.quill.enable(this.isMetadataEnable);
        if(!this.isMetadataEnable){
            this.parentFormGroup.controls.sourceLabel.setValue('');
            this.parentFormGroup.controls.sourceLink.setValue('');
            this.parentFormGroup.controls.description.setValue('');
            this.listSelectedPages = [];
            this.updateParagraphFormArrayByIdx('description', '', this.parentFormGroup.controls.description.errors);
            this.updateParagraphFormArrayByIdx('tagToPages', [], this.parentFormGroup.controls.tagToPages.errors);
            this.updateParagraphFormArrayByIdx('sourceLabel', '', this.parentFormGroup.controls.sourceLabel.errors);
            this.updateParagraphFormArrayByIdx('sourceLink', '', this.parentFormGroup.controls.sourceLink.errors);
        }

        const status = this.parentFormGroup.controls.image.hasError('required') ? FORM_STATE.INVALID : FORM_STATE.VALID;
        this.formActions.updateFormArrayByIdx('paragraphs', this.idx, {
            propertyKey: 'image',
            propertyValue: imageInfo,
            propertyState: formControl.errors
        });

        const id = this.paragraph ? this.paragraph.entityId : 0;
        this.contentActions.updateFormGroupStatus( `paragraph_${id}`, status );

        if(this.autosave && FORM_STATE.VALID === status) {
                this.contentActions.saveParagraphEntity(false, this.paragraph.entityId).subscribe();
        }
    }

    updateParagraphFormArrayByIdx(propertyKey, propertyValue, propertyState){
        this.formActions.updateFormArrayByIdx( 'paragraphs', this.idx,
            { propertyKey, propertyValue, propertyState});
    }
}
