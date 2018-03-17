import { Component, OnInit, OnChanges, Input,
    ViewEncapsulation, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { ContentActions, FormActions } from 'state';
import { ParagraphText } from 'models';
import { FORM_STATE } from 'constant';
import { ParagraphHelper } from 'utils';

@Component({
    selector: 'text-paragraph',
    templateUrl: 'text-paragraph.html',
    styleUrls: ['text-paragraph.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TextParagraphComponent implements OnInit, AfterViewInit, OnChanges {

    @Input('parent-form-group') parentFormGroup: FormGroup;
    @Input('show-title') showTitle: boolean = true;
    @Input('autosave') autosave: boolean = true;
    @Input() paragraph: ParagraphText;
    @Input() idx: number;
    @Input() parentType:string;
    @Input() isReadOnly: boolean = false;

    @ViewChild('quillEditor') private quillEditor: any;

    private isFormChanged: boolean = false;

    constructor(private contentActions: ContentActions, private formActions: FormActions) {}

    ngOnInit() {}

    ngAfterViewInit(){
        ParagraphHelper.clearStyleOnCopy(this.quillEditor.quill);
        this.quillEditor.quill && this.quillEditor.quill.enable(!this.isReadOnly);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isReadOnly']) {
            this.quillEditor.quill && this.quillEditor.quill.enable(!changes['isReadOnly']['currentValue']);
        }
    }

    onTextParagraphChanged(e: any) {
      if(this.autosave) {
          setTimeout(function() {
                this.contentActions
                    .saveParagraphEntity(false, this.paragraph.entityId)
                    .subscribe();
          }.bind(this), 200);
      }
    }

    editorChanged(data) {
        const { htmlValue } = data;

        if (htmlValue) {
            this.formActions.updateFormArrayByIdx('paragraphs', this.idx, {
                propertyKey: 'description',
                propertyValue: htmlValue,
                propertyState: undefined
            });
        }
    }

    updateValueAndValidity() {
        if(this.parentFormGroup.controls.description){
            this.parentFormGroup.controls.description.updateValueAndValidity();
            this.parentFormGroup.controls.description.markAsDirty();
        }
    }
}
