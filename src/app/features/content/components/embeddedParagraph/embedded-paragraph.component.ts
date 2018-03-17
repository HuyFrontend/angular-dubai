import { Observable } from 'rxjs/Observable';
import {
  Component, OnInit, Input, OnChanges, SimpleChanges,
  ViewEncapsulation, ViewChild, AfterViewInit
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeHtml } from '@angular/platform-browser';

import { processEmbed } from 'utils/embedded-iframe';
import { isKnownEmbedCode, processEmbedCodeFrom, EMBED_TYPE } from 'utils';
import { DEBOUNCE_TIME } from 'configs';
import { ContentActions, FormActions } from 'state';
import { ParagraphEmbeddedCode } from 'models';
import { ParagraphHelper } from 'utils';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'embedded-paragraph',
  templateUrl: 'embedded-paragraph.html',
  styleUrls: ['embedded-paragraph.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmbeddedParagraphComponent implements OnInit, OnChanges {

  @ViewChild('quillEditor') private quillEditor: any;

  @Input('parent-form-group') parentFormGroup: FormGroup;
  @Input('show-title') showTitle: boolean = true;
  @Input('autosave') autosave: boolean = true;
  @Input() idx: number;
  @Input() paragraph: ParagraphEmbeddedCode;
  @Input() parentType: string;
  @Input() isReadOnly: boolean = false;

  public trustedHTML: SafeHtml;
  public trustedUrl: SafeUrl;
  public iframeSubject = new Subject();
  public iframe$ = this.iframeSubject.asObservable();
  public codeSubject = new Subject();
  public code$ = this.codeSubject.asObservable();
  public loading: boolean = false;

  constructor(
    private formActions: FormActions,
    private contentActions: ContentActions,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    this.showPreviewCurrentCode();
    if (changes.isReadOnly) {
      this.quillEditor && this.quillEditor.quill && this.quillEditor.quill.enable(!changes.isReadOnly.currentValue);
    }
  }

  ngOnInit() {
    this.showPreviewCurrentCode();

    let socialPlatform: string = '';
    this.code$.distinctUntilChanged()
      .filter((codeSnippet: string) => {
        const { isValidatedSource, sourceName } = isKnownEmbedCode(codeSnippet);
        if (!isValidatedSource) {
          this.trustedUrl = '';
          this.trustedHTML = '';
          this.parentFormGroup.controls.sourceName.setValue('');
        }
        socialPlatform = sourceName;

        return isValidatedSource;
      })
      .subscribe((codeSnippet: string) => {
        this.loading = true;
        this.getIframe(codeSnippet, socialPlatform);
      });

    this.iframe$.skip(1).subscribe(event => {
      this.loading = false;
    });
  }

  ngAfterViewInit() {
    ParagraphHelper.clearStyleOnCopy(this.quillEditor.quill);
  }

  /**
   * Show iframe preview of current embed code
   *
   * @memberof EmbeddedParagraphComponent
   */
  showPreviewCurrentCode() {
    const code: string = this.parentFormGroup.controls.codeSnippet.value,
          { sourceName } = isKnownEmbedCode(code),
          srcName = sourceName;

    this.getIframe(code, srcName);
  }


  getIframe(embeddedString: string, socialPlatform: string) {
    this.parentFormGroup.controls.sourceName.setValue(socialPlatform);
    if (!embeddedString) {
      this.trustedUrl = ''
    }

    const embedded = processEmbedCodeFrom(embeddedString, socialPlatform);
    if (embedded && embedded.host) {
      if (embedded.embedSrc) {
        this.trustedHTML = '';
        this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedded.embedSrc);
      } else {
        this.trustedUrl = '';
        if (embedded.host === EMBED_TYPE.twitter) {
          // TODO: hide loading is not correct now, find some ways to check if twitter is loaded and hide the loading later, the loading callback in js below is not correct also.
          this.loading = false;
          this.trustedHTML = this.sanitizer.bypassSecurityTrustHtml(`<div class="frame-container ${embedded.embedContainerId}"></div>`);
        } else {
          this.loading = false;
          this.trustedHTML = this.sanitizer.bypassSecurityTrustHtml(embedded.codeSnippet);
        }
        this.loadScript(embedded);
        this.executeScript(embedded);
      }
    } else {
      this.trustedUrl = '';
    }
  }

  loadScript(embeded) {
    if (embeded.scriptUrl) {
      if (embeded.host === 'twitter') {
        window['twttr'] = (function(d, s, id, url) {
          let js, fjs = d.getElementsByTagName(s)[0],
              t = window['twttr'] || {};

          if (d.getElementById(id)) return t;

          js = d.createElement(s);
          js.id = id;
          js.src = url;
          fjs.parentNode.insertBefore(js, fjs);

          t._e = [];

          t.ready = function(f) {
            t._e.push(f);
          };

          return t;
        }(document, 'script', embeded.scriptId, embeded.scriptUrl));
      } else if (embeded.host === 'instagram') {
        (function(d, s, id, url) {
          let js, fjs = d.getElementsByTagName(s)[0],
              t = window['instgrm'] || {};

          if (d.getElementById(id)) return t;

          js = d.createElement(s);
          js.id = id;
          js.src = url;
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', embeded.scriptId, embeded.scriptUrl));
      }
    }
  }

  getTweetId(containerStringId: string): string {
    if (containerStringId.match('tweet-container-([0-9A-Za-z-_]+)-([0-9A-Za-z-_]+)')) {
      return RegExp.$1;
    }

    return '';
  }

  executeScript(embeded) {
    if (embeded && embeded.host === 'twitter') {
      if (embeded.tweetType === 'tweet') {
        if (window['twttr']) {
          setTimeout(() => {
            window['twttr'].ready(twttr => {
              let elms = document.getElementsByClassName(embeded.embedContainerId);
              for (let i = 0; i < elms.length; i++) {
                twttr.widgets.createTweet(
                  this.getTweetId(embeded.embedContainerId), elms[i], { align: 'left'}
                ).then(el => {
                  this.loading = false;
                });
              }
            });
          }, 0);
        }
      } else if (embeded.tweetType === 'tweet-timeline') {
        if (window['twttr']) {
          window['twttr'].ready(twttr => {
            let elms = document.getElementsByClassName(embeded.embedContainerId);
            for (let i = 0; i < elms.length; i++) {
              twttr.widgets.createTimeline({
                sourceType: 'profile',
                screenName: embeded.author
              }, elms[i]).then(el => {
                this.loading = false;
              });
            }
          });
        }
      } else if (embeded.tweetType === 'tweet-follow') {
        if (window['twttr']) {
          window['twttr'].ready(twttr => {
            this.loading = false;
          });
        }
      } else if (embeded.tweetType === 'tweet-mention') {
        if (window['twttr']) {
          window['twttr'].ready(twttr => {
            this.loading = false;
          });
        }
      }
    } else if (embeded && embeded.host === 'instagram') {
      if (window['instgrm']) {
        window['instgrm'].Embeds.process();
      }
    }
  }

  deleteEmbedded() {
    this.parentFormGroup.controls.codeSnippet.setValue('');
    this.parentFormGroup.controls.sourceName.setValue('');
    this.trustedUrl = '';
    this.trustedHTML = '';
    return false;
  }

  onTextParagraphChanged(e: any) {
    if (this.autosave) {
      setTimeout(function () {
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
    this.parentFormGroup.controls.codeSnippet.updateValueAndValidity();
    this.parentFormGroup.controls.codeSnippet.markAsDirty();
  }
}
