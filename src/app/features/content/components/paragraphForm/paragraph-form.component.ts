import {
    Component, OnInit, SimpleChanges, OnChanges, OnDestroy,
    EventEmitter, Input, Output, ViewChild,
    ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import {
    Article, Paragraph, ParagraphText,
    ParagraphImage, ParagraphEmbeddedCode
} from 'models';
import { ContentActions } from 'state';
import {
    PARAGRAPH_TYPE, MOVE_DIRECTION,
    FORM_STATE, VIEW_OPTIONS
} from 'constant';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { ParagraphHelper } from 'utils/paragraph-helper';

@Component({
    selector: 'paragraph-form',
    templateUrl: 'paragraph-form.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['paragraph-form.scss']
})

export class ParagraphFormComponent implements OnInit, OnChanges, OnDestroy {

    /**
     * Fetch all value from store.
     *
     */
    @Input() paragraphs: Paragraph[];
    @Input() isCreate: boolean;
    @Input() paragraphViewOption: string;
    @Input() shouldValidate: boolean;
    @Input() isFormSubmitted: boolean;
    @Input() isReadOnly: boolean = false;

    @Output() onRemoveParagraph: EventEmitter<boolean> = new EventEmitter<boolean>();
    /**
     * Public properties for View.
     * @memberOf ParagraphFormComponent
     */
    public paragraphFormArray: FormArray;
    public paragraphArrayToggle: Array<any>;
    public paragraphsState: Array<any>;
    public draggedParagraph: string;
    public currentDrop: number;

    private paragraphDrapIndex: number;

    @ViewChild('confirmRemoveParagraphPopup') public confirmRemoveParagraphPopup: MBCConfirmationComponent;

    constructor(
        private contentActions: ContentActions,
        private router: Router)
    {
        this.paragraphArrayToggle = [];
        this.paragraphFormArray = new FormArray([]);
    }

    ngOnInit() {}
    ngOnDestroy() {
        this.contentActions.resetForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        const { shouldValidate, paragraphs } = changes;
        if(paragraphs) {
            if(this.paragraphs && this.paragraphs.length > 0) {
                this.paragraphFormArray.controls.forEach((element: FormGroup) => {
                     let entityId = element.controls.entityId.value;
                     let paragraphFilters = this.paragraphs.filter(x=>x.entityId == entityId);
                     if(paragraphFilters && paragraphFilters.length > 0) {
                        let order = paragraphFilters[0].order;
                        element.controls.order.setValue(order);
                     }
                });
                let formControl: AbstractControl[];
                formControl = this.paragraphFormArray.controls.sort(this.sortByOrder);
                this.paragraphFormArray.controls = [...formControl];
                this.paragraphs.forEach((paragraph, idx) => {
                    const formGroup = <FormGroup>this.paragraphFormArray.at(idx);
                    if (formGroup && paragraph.entityId == formGroup.controls.entityId.value) {
                        this.bindValueToControl(paragraph, formGroup);
                    } else {
                        const initFormGroup = ParagraphHelper.createFormGroup(paragraph);
                        this.paragraphFormArray.push(initFormGroup);
                        this.paragraphArrayToggle[idx] = true;
                    }
                });
            } else {
                this.paragraphs = [];
                this.paragraphFormArray = new FormArray([]);
            }
        }
        if(shouldValidate && shouldValidate.currentValue) {
            this.paragraphs.forEach((paragraph, idx)=> {
                if(paragraph.type === PARAGRAPH_TYPE.IMAGE) {
                    const group = <FormGroup>this.paragraphFormArray.at(idx);
                    group.controls.image.updateValueAndValidity();
                }
            });
        }
    }

    validateParagraphs(){
        let valid: boolean = true;
        this.paragraphs.forEach((paragraph, idx)=> {
            const group = <FormGroup>this.paragraphFormArray.at(idx);
            valid = valid && group.valid;
            if(paragraph.type === PARAGRAPH_TYPE.IMAGE) {
                group.controls.image.updateValueAndValidity();
            }
            if(paragraph.type === PARAGRAPH_TYPE.TEXT) {
                group.controls.description.updateValueAndValidity();
                group.controls.description.markAsDirty();
            }
            if(paragraph.type === PARAGRAPH_TYPE.EMBEDDED) {
                group.controls.codeSnippet.updateValueAndValidity();
                group.controls.codeSnippet.markAsDirty();
            }
        });
        return valid;
    }

    sortByOrder(a: any, b: any) {
        if (a.value.order < b.value.order)
            return -1;
        if (a.value.order > b.value.order)
            return 1;
        return 0;
    }

    bindValueToControl(paragraph, formGroup: FormGroup): void {
        const { controls: formControls } = formGroup;
        Object.keys(formControls).map((key, idx, arr) => {
            if (formControls[key]) {
                if(formControls[key].value != paragraph[key]){
                    formControls[key].setValue(paragraph[key], { onlySelf: true, emitEvent: false });
                }
            }
        });
    }

    getBullet(idx: number) {
        if(this.paragraphViewOption === VIEW_OPTIONS.NUMBERED) {
            return idx + 1;
        }
        if(this.paragraphViewOption === VIEW_OPTIONS.NUMBERED_COUNT_DOWN) {
            return this.paragraphFormArray.controls.length - idx;
        }
    }

    //FIXME: Should get this in state.
    getNextOrder(): number {
        return this.paragraphs.length;
    }

    getParagraphIns(type: string) {
        switch (type) {
            case PARAGRAPH_TYPE.IMAGE:
                return new ParagraphImage(type, this.getNextOrder());
            case PARAGRAPH_TYPE.EMBEDDED:
                return new ParagraphEmbeddedCode(type, this.getNextOrder());
            case PARAGRAPH_TYPE.TEXT:
            default:
                return new ParagraphText(type, this.getNextOrder());
        }
    }

    addParagraphGroup(type): void {
        const paragraphInstance = this.getParagraphIns(type);
        // Create paragraph entity and create form in parallel.
        // FIXME: do it in actions instead of.
        this.contentActions
            .saveParagraphEntity(true, paragraphInstance)
            .subscribe(entityId => {
                this.contentActions.updateFormGroupStatus(
                    `paragraph_${entityId}`,
                    paragraphInstance.type === PARAGRAPH_TYPE.IMAGE ? FORM_STATE.INVALID : FORM_STATE.VALID
                )
            });
    }

    moveParagraph(index, direction) {
        let nextIndex;
        if (direction === MOVE_DIRECTION.DOWN) {
            if (index >= this.paragraphFormArray.length - 1) return false;
            nextIndex = index + 1;
        } else if (direction === MOVE_DIRECTION.UP) {
            if (index <= 0) return false;
            nextIndex = index - 1;
        }

        const currentItem = <FormGroup>this.paragraphFormArray.at(index);
        const nextItem = <FormGroup>this.paragraphFormArray.at(nextIndex);

        const firstEntity = {
            ...this.paragraphs[nextIndex],
            order: nextIndex
        };
        const secondEntity = {
            ...this.paragraphs[index],
            order: index
        };
        this.contentActions.updateOrderParagraph(firstEntity, secondEntity);
        this.paragraphFormArray.setControl(index, nextItem);
        this.paragraphFormArray.setControl(nextIndex, currentItem);
    }

    toggleParagraph(index) {
        this.paragraphArrayToggle[index] = !this.paragraphArrayToggle[index];
    }

    hasOneExpanded() {
        for(let i=0; i< this.paragraphArrayToggle.length; i++) {
            if(this.paragraphArrayToggle[i]) {
                return true;
            }
        }
        return false;
    }

    toggleAllParagraphs() {
        this.paragraphArrayToggle.fill(!this.hasOneExpanded());
    }

    getDisplayParagraph(index) {
        return this.paragraphArrayToggle[index] ? true : false;
    }

    confimRemoveParagraph(indexToRemove) {
        this.confirmRemoveParagraphPopup.show(indexToRemove);
    }

    removeParagraph(indexToRemove) {
        this.contentActions.removeParagraph(indexToRemove)
            .subscribe(res=> {
                this.paragraphFormArray.removeAt(indexToRemove);
                this.paragraphArrayToggle.splice(indexToRemove, 1);
                this.onRemoveParagraph.emit(true);
            });
    }

    dropParagraph(event: any, index: number) {
        if(index != this.paragraphDrapIndex + 1){
            if(this.paragraphDrapIndex < index){
                index = index - 1;
            }
            this.contentActions.updateOrderDrapDropParagraphs(this.paragraphDrapIndex, index);
        }
        this.currentDrop = -1;
    }

    dragStartParagraph(event: any, index: number) {
        this.paragraphDrapIndex = index;
        this.draggedParagraph = 'drapped';
    }

    dragEndParagraph(event: any) {
        this.draggedParagraph = null;
    }

    onDragOverParagraph(event: any, index: number){
        this.currentDrop = index;
        event.dataTransfer.dropEffect = 'move';
    }
    onDragEndParagraph(event:any){
        this.currentDrop = -1;
    }

    resetParagraphForm() {
        this.paragraphFormArray = new FormArray([]);
    }

}
