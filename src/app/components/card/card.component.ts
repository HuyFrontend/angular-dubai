import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Observable } from 'rxjs';
import { ImageInfo } from 'models';
import { CloudinaryService, PageService, ContentService } from 'services';
import { getDateFormat } from 'utils';
import { CARD_ACTION } from './card.constant';
@Component({
  selector: 'card',
  templateUrl: 'card.html',
  styleUrls: ['card.scss'],
})
export class CardComponent implements OnInit, OnChanges {

  @Input() public imageInfo: any;
  @Input() isTypeSelectMultiple: boolean;
  @Output() onAdded: EventEmitter<ImageInfo> = new EventEmitter<ImageInfo>();

  @Output() onSelectedItem: EventEmitter<{ type: string, data: ImageInfo }> = new EventEmitter<{ type: string, data: ImageInfo }>();

  @ViewChild('imageElement') imageElement: ElementRef;

  public isSelectedItem: boolean;
  public cardAction =  CARD_ACTION;

  constructor(private cloudinaryService: CloudinaryService,
    private pageService: PageService,
    private contentService: ContentService,
    private renderer: Renderer
  ) {
    this.isSelectedItem = false;
  }

  ngOnInit() {
    this.initCardEvents();
  }
  ngOnChanges() {
    if (this.imageInfo) {
      this.imageInfo.uploaded_at = getDateFormat(this.imageInfo.uploaded_at, 'DD/MM/YYYY');
    }

  }
  addImage() {
    this.formatDataImageInfo().subscribe( e=>{
        this.onAdded.emit(e);
      }
    );
  }

  formatDataImageInfo() :Observable<ImageInfo>{
    return this.contentService.getPageFromPageNames((this.imageInfo.context && this.imageInfo.context.taggedPageTitles) ? this.imageInfo.context.taggedPageTitles : '')
      .map(listPage => this.convertToContentRelationship(listPage))
      .map(tagToPages => {
        const urls = this.cloudinaryService.transformImageURL(
          this.imageInfo.public_id,
          this.imageInfo.format,
          this.imageInfo.version
        );
        let imageInfo: ImageInfo = {
          damId: this.imageInfo.public_id,
          url: urls.urlOriginal,
          isDefault: false,
          tagToPages: tagToPages,
          properties: {
            fileType: this.imageInfo.format,
            version: this.imageInfo.version
          },
          metadata: {
            description: (this.imageInfo.context && this.imageInfo.context.description) ? this.imageInfo.context.description : '',
            sourceLabel: (this.imageInfo.context && this.imageInfo.context.sourceLabel) ? this.imageInfo.context.sourceLabel : '',
            sourceLink: (this.imageInfo.context && this.imageInfo.context.sourceLink) ? this.imageInfo.context.sourceLink : '',
          }
        };

        return imageInfo;
      })
  }
  /**
   * detect select mutiple and init event for each card in list
   */
  initCardEvents() {
    if (this.isTypeSelectMultiple) {
      this.renderer.listen(this.imageElement.nativeElement, 'click', () => {
        this.changeSelectedItem();
      });
    }
  }
  /**
   * change item checkbox
   */
  changeSelectedItem() {
    this.isSelectedItem = !this.isSelectedItem;
    if (this.isSelectedItem) {
      this.formatDataImageInfo().subscribe( (imageInfo) => {
          this.onSelectedItem.emit({ type: 'add', data: imageInfo });
        }
      );
    } else {
      this.formatDataImageInfo().subscribe( (imageInfo) => {
          this.onSelectedItem.emit({ type: 'remove', data: imageInfo });
        }
      );
    }
  }

  convertToContentRelationship(listItem: any[]) {
    return listItem.map((p) => ({
      displayName: p.data.info.internalUniquePageName,
      internalUniquePageName: p.data.info.internalUniquePageName,
      entityId: p.entityId
    }));
  }
  addOneItem() {
    this.formatDataImageInfo().subscribe( (imageInfo) => {
      this.onSelectedItem.emit({ type: 'addSelected', data: imageInfo });
    });
  }
}
