import { notEmpty } from 'modules/mForm/validators';
import { PARAGRAPH_TYPE, FORM_STATE } from 'constant';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Paragraph, ParagraphImage, ParagraphImagePost, ParagraphEmbeddedCode, ParagraphText } from 'models/content/paragraph.model';
import { PhotoAlbum } from 'models';

export class ParagraphHelper {

  public static createEmbedFormGroup(paragraph) : FormGroup {
    const formGroup = new FormGroup({
        id: new FormControl(paragraph.entityId),
        order: new FormControl(paragraph.order),
        entityId: new FormControl(paragraph.entityId),
        title: new FormControl(paragraph.title),
        type: new FormControl(paragraph.type),
        description: new FormControl(paragraph.description),
        sourceName: new FormControl(paragraph.sourceName),
        codeSnippet: new FormControl(paragraph.codeSnippet,[notEmpty()]),
    });
    return formGroup;
  }

  public static isEmbedParagraphHasData(formGroup: FormGroup, isSingleParagraph: boolean = false) {
    return (formGroup.controls.description.value != '' && !isSingleParagraph)
        || formGroup.controls.codeSnippet.value != '';
  }

  public static createImageFormGroup(paragraph) : FormGroup {
    const formGroup = new FormGroup({
        id: new FormControl(paragraph.entityId),
        entityId: new FormControl(paragraph.entityId),
        order: new FormControl(paragraph.order),
        title: new FormControl(paragraph.title),
        label: new FormControl(paragraph.label),
        type: new FormControl(paragraph.type),
        description: new FormControl(paragraph.description),
        sourceLink: new FormControl(paragraph.sourceLink),
        sourceLabel: new FormControl(paragraph.sourceLabel),
        tagToPages: new FormControl(paragraph.tagToPages),
        image: new FormControl(paragraph.image, [Validators.required])
    });
    return formGroup;
  }

  public static createImagePostFormGroup(paragraph) : FormGroup {
    const fb = new FormBuilder();
    const formGroup = fb.group({
        id: [paragraph.entityId],
        entityId: [paragraph.entityId],
        order: [paragraph.order],
        title: [paragraph.title],
        type: [paragraph.type],
        description: [paragraph.description],
        image: [paragraph.image] // can have single image or multiple images
    });
    return formGroup;
  }

  public static isImageParagraphHasData(formGroup: FormGroup, isSingleParagraph: boolean = false) {
    return formGroup.controls.label.value != ''
        || (formGroup.controls.description.value != '' && !isSingleParagraph)
        || formGroup.controls.sourceLink.value != ''
        || formGroup.controls.sourceLabel.value != ''
        || formGroup.controls.tagToPages.value != ''
        || formGroup.controls.image.value != '';
  }

  public static isImagePostParagraphHasData(formGroup: FormGroup, isSingleParagraph: boolean = false) {
    const photoAlbum:PhotoAlbum = formGroup.controls.image.value;
    return photoAlbum.images.length > 0
        || photoAlbum.tagToPages.length > 0
        || photoAlbum.description.trim().length > 0
        || photoAlbum.title.trim().length > 0;
  }

  public static createTextFormGroup(paragraph) : FormGroup {
    const formGroup = new FormGroup({
        id: new FormControl(paragraph.entityId),
        entityId: new FormControl(paragraph.entityId),
        order: new FormControl(paragraph.order),
        title: new FormControl(paragraph.title),
        type: new FormControl(paragraph.type),
        description: new FormControl(paragraph.description, [notEmpty()])
    });
    return formGroup;
  }

  public static isTextParagraphHasData(formGroup: FormGroup) {
    return formGroup.controls.description.value != '';
  }

  public static isParagraphHasData(formGroup: FormGroup) {
    let hasData = false;
    switch(formGroup.controls.type.value) {
      case PARAGRAPH_TYPE.IMAGE:
        hasData = ParagraphHelper.isImageParagraphHasData(formGroup);
        break;
      case PARAGRAPH_TYPE.EMBEDDED:
      case PARAGRAPH_TYPE.LIVE:
        hasData = ParagraphHelper.isEmbedParagraphHasData(formGroup);
        break;
      case PARAGRAPH_TYPE.TEXT:
      default:
        hasData = ParagraphHelper.isTextParagraphHasData(formGroup);
        break;
    }
    return hasData;
  }

  public static isSingleParagraphChange(formGroup: FormGroup) {
    let isChange = false;
    switch(formGroup.controls.type.value) {
      case PARAGRAPH_TYPE.IMAGE:
        isChange = ParagraphHelper.isImagePostParagraphHasData(formGroup, true);
        break;
      case PARAGRAPH_TYPE.EMBEDDED:
      case PARAGRAPH_TYPE.LIVE:
        isChange = ParagraphHelper.isEmbedParagraphHasData(formGroup, true);
        break;
    }
    return isChange;
  }

  public static createFormGroup(paragraph, isPostParagraph?:boolean) : FormGroup {
    let formGroup: FormGroup;
    switch (paragraph.type) {
      case PARAGRAPH_TYPE.IMAGE:
        if(isPostParagraph){
          formGroup = ParagraphHelper.createImagePostFormGroup(paragraph);
        } else {
          formGroup = ParagraphHelper.createImageFormGroup(paragraph);
        }
        break;
      case PARAGRAPH_TYPE.EMBEDDED:
      case PARAGRAPH_TYPE.LIVE:
        formGroup = ParagraphHelper.createEmbedFormGroup(paragraph);
        break;
      case PARAGRAPH_TYPE.TEXT:
      default:
        formGroup = ParagraphHelper.createTextFormGroup(paragraph);
        break;
    }
    return formGroup;
  }

  public static createParagraph(type: string, order: number) : Paragraph {
    let p: Paragraph;
    switch (type) {
      case PARAGRAPH_TYPE.IMAGE:
        p = new ParagraphImagePost(PARAGRAPH_TYPE.IMAGE, order);
        break;
      case PARAGRAPH_TYPE.EMBEDDED:
        p = new ParagraphEmbeddedCode(PARAGRAPH_TYPE.EMBEDDED, order);
        break;
      case PARAGRAPH_TYPE.LIVE:
        p = new ParagraphEmbeddedCode(PARAGRAPH_TYPE.LIVE, order);
        break;
      case PARAGRAPH_TYPE.TEXT:
      default:
        p = new ParagraphText(PARAGRAPH_TYPE.TEXT, order);
        break;
    }
    return p;
  }

  public static clearStyleOnCopy(quill: any){
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, function (node, delta) {
            delta.forEach(element => {
                element.attributes = [];
            });
            return delta;
        });
  }

}
