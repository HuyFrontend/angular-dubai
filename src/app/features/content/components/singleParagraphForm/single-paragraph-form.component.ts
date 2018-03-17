import {
  Component, OnInit, SimpleChanges, OnChanges,
  EventEmitter, Input, Output, ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Post, Paragraph, ParagraphText, ParagraphImage, ParagraphEmbeddedCode } from 'models';
import { IParagraph } from 'models/content/paragraph.model';
import { PostActions } from 'state';
import { PageService } from 'services';
import { PARAGRAPH_TYPE, FORM_STATE } from 'constant';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { TextParagraphComponent } from '../textParagraph';
import { EmbeddedParagraphComponent } from '../embeddedParagraph';
import { ImagePostComponent } from '../imagePost';
import { DEBOUNCE_TIME } from 'configs';
import { ParagraphHelper } from 'utils/paragraph-helper';

@Component({
  selector: 'single-paragraph-form',
  templateUrl: 'single-paragraph-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
        .btn-paragraph {
            cursor: pointer;
        }

        :host > .row:first-child {
            border-bottom: none;
        }
    `]
})

export class SingleParagraphFormComponent implements OnChanges {
  @Input() isCreate: boolean;
  @Input() post: Post;
  @Input() isFormSubmitted: boolean;
  @Input() isRequiredAlbumTitle: boolean;
  @Input() isReadOnly: boolean = false;

  @ViewChild('confirmChange') public confirmChange: MBCConfirmationComponent;
  @ViewChild('imagePostParagraph') public imagePostParagraph: ImagePostComponent;
  @ViewChild('textParagraph') public textParagraph: TextParagraphComponent;
  @ViewChild('embeddedParagraph') public embeddedParagraph: EmbeddedParagraphComponent;
  @ViewChild('streamParagraph') public streamParagraph: EmbeddedParagraphComponent;

  public formGroup: FormGroup;

  constructor(
    private postActions: PostActions,
    private pageService: PageService,
    private router: Router) {

  }

  initParagraphByType() {
    if(!this.post.paragraphs) {
      return;
    }

    let paragraph: IParagraph = this.post.paragraphs[0];
    let formGroup: FormGroup = ParagraphHelper.createFormGroup(paragraph, true);
    this.formGroup = formGroup;
    this.bindValueToControl(paragraph, this.formGroup);
  }

  bindValueToControl(paragraph, formGroup: FormGroup): void {
    const { controls: formControls } = formGroup;
    Object.keys(formControls).map((key, idx, arr) => {
      const isFormControlInstance = formControls[key] instanceof FormControl;
      if (paragraph[key] && formControls[key] && isFormControlInstance) {
        formControls[key].setValue(paragraph[key], { onlySelf: true, emitEvent: false });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!changes.post || !changes.post.currentValue.type) return;
    if (!this.formGroup
      || !changes.post.previousValue
      || changes.post.previousValue.entityId != changes.post.currentValue.entityId) {
      this.initParagraphByType();
    }
  }

  changeParagraph($event) {
    if(this.post.paragraphs[0].type !== $event.type && !this.isReadOnly) {
      if (ParagraphHelper.isSingleParagraphChange(this.formGroup)) {
          this.confirmChange.show({type: $event.type});
      } else {
        this.confirmChangeParagraph($event);
      }
    }
  }

  confirmChangeParagraph($event) {
    const description = this.post.paragraphs[0].description;
    this.post.paragraphs[0] = ParagraphHelper.createParagraph($event.type, 0);
    this.post.paragraphs[0].description = description;
    this.initParagraphByType();
  }

  updateValueAndValidity() {
    if(this.imagePostParagraph) {
      this.imagePostParagraph.updateValueAndValidity();
    }
    if(this.textParagraph){
      this.textParagraph.updateValueAndValidity();
    }
    if(this.embeddedParagraph){
      this.embeddedParagraph.updateValueAndValidity();
    }
    if(this.streamParagraph){
      this.streamParagraph.updateValueAndValidity();
    }
  }

  isActiveClass(type: string) : string {
    return this.post.paragraphs[0].type === type ? 'active' : '';
  }

  isValid(){
    this.updateValueAndValidity();
    return this.formGroup.valid;
  }

}
