import {
    Component,
    Input,
    ViewEncapsulation,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
    OnChanges,
    AfterViewInit,
    EventEmitter,
    Output,
    SimpleChanges,
    OnInit,
    NgZone
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { CloudinaryService } from "services";
import { MBCConfirmationComponent } from "components/mbcConfirmation";
import { CLOUDINARY } from "constant";
import { ImageInfo, PageSuggestionRequest } from "models";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PageService } from 'services';
import { Editor } from 'primeng/primeng';
import { ImageUploadWidgetOption, ImageUploadWidgetImageInfo } from './image-upload-widget.model';
import uniqueId from 'lodash/uniqueId';
import { SearchWidgetComponent } from 'components/searchWidget';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders, FileLikeObject } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-4.x';

@Component({
    selector: "image-upload-widget",
    templateUrl: "image-upload-widget.html",
    styleUrls: ["image-upload-widget.scss"],
    encapsulation: ViewEncapsulation.None
})
export class ImageUploadWidgetComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() imageInput: ImageInfo;
    @Input() options: ImageUploadWidgetOption;
    @Input() title: string;
    @Input() isCollapsed:boolean = true;
    @Input() isFormSubmitted: boolean; //used to show error message on component (when form submit) if options field have any validation (optional)
    @Input() uploaderId: string;
    @Input() isReadOnly: boolean = false;
    // Temporary for now
    @Input() persistSizes:boolean = false;

    @Output() imageChange: EventEmitter<ImageInfo> = new EventEmitter<ImageInfo>();
    @Output() setDefault: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() isCollapsedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() isUploadMultiple: EventEmitter<boolean> = new EventEmitter<boolean>();


    @ViewChild('confirmPopup') public confirmPopup: MBCConfirmationComponent;
    @ViewChild('quillEditor') public quillEditor: Editor;
    @ViewChild('searchWidget') searchWidget: SearchWidgetComponent;

    public imageInfo: ImageUploadWidgetImageInfo;
    public isMetadataEnable: boolean;
    public currentRatio: string;
    public instanceId: string;
    public flags: any;
    public uploader: FileUploader;
    public errorUploading: any;
    private referenceRatio = new Map([
      ['Logo' , '16_16'],
      ['Poster' , '16_9'],
      ['Cover' , '27_40']
    ])

    private quill: any;
    private defaultOption = this.getDefaultOptions();
    constructor(
        private cloudinaryService: CloudinaryService,
        private changeDetectorRef: ChangeDetectorRef,
        private elementRef: ElementRef,
        private pageService: PageService,
        private cloudinary: Cloudinary,
        private zone: NgZone
    ) {
        this.options = {...this.defaultOption};
        this.flags = {
            isUploading: false,
            isHaveImage: false  //start with dummy image
        }
        this.instanceId = uniqueId();
        this.setDefaultRatio();
    }

    ngOnInit(): void {
      this.initUploader();
    }

    ngAfterViewInit(){
        this.quill = this.quillEditor.quill;
        this.quill.enable(!this.isReadOnly);
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.imageInput){
          if(!this.uploader || !this.uploader.isUploading){
            this.loadInputImage();
          }
        }
        if(changes.options){
            this.options = Object.assign({...this.defaultOption}, changes.options.currentValue);
            if(changes.options.isFirstChange()){
              this.setDefaultRatio();
            }
        }
        //safe check for options.isCollapsable as it affect isCollapsed
        this.isCollapsed = this.options.isCollapsable ? this.isCollapsed : false;
        if (changes.isReadOnly) {
            if (changes.isReadOnly.currentValue) {
                this.quill && this.quill.enable(false);
            } else {
                this.quill && this.quill.enable(true);
            }
        }
    }

    initUploader(){
      this.uploader = this.cloudinaryService.getUploader(this.options);
      this.uploader.onSuccessItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
          this.upsertResponse({file: item.file, status, data: JSON.parse(response)});
      }

      this.uploader.onErrorItem = (item, response, status, headers) => {
        this.errorUploading = JSON.parse(response).error.message;
      }

      this.uploader.onBeforeUploadItem = () => {
        this.errorUploading = null;
      };

      this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) =>{
        switch (filter.name) {
          case 'fileSize':
              this.errorUploading = `Following image exceed limitation of 10 Mbs: ${item.name}`;
              break;
          default:
              this.errorUploading = `Unknown error (${filter.name})`;
        }
      }
    }

    upsertResponse(fileItem: any){
      this.zone.run(() => {
        if(fileItem.status){
          const savedMetadata = this.imageInfo.metadata || {};
          const isDefault = this.imageInfo.isDefault;
          let tagToPages = this.imageInfo.tagToPages || [];
          this.imageInfo = this.cloudinaryService.buildImageInfo(fileItem.data, isDefault, tagToPages, savedMetadata);
          this.isMetadataEnable = true;
          this.flags.isHaveImage = true;
          this.quill.enable(true);
          this.emitChange(this.imageInfo);
          this.changeDetectorRef.detectChanges();
        }
      });
    }

    private loadInputImage() {
        if (!this.imageInput || !this.imageInput.damId || this.imageInput.damId === CLOUDINARY.DUMMY_IMAGE.PUBLIC_ID) {
            this.setDummyImage();
        } else {

            this.imageInfo = {...this.imageInput};
            this.imageInfo.tagToPages = this.imageInfo.tagToPages || [];
            this.imageInfo.metadata = this.imageInfo.metadata || {};
            if(this.imageInfo.properties){
              const urls = this.cloudinaryService.transformImageURL(
                  this.imageInfo.damId,
                  this.imageInfo.properties.fileType,
                  this.imageInfo.properties.version
              );

              this.imageInfo.url16_9 = urls.url16_9;
              this.imageInfo.url16_16 = urls.url16_16;
              this.imageInfo.url27_40 = urls.url27_40;

              if(this.imageInfo.tagToPages){
                  this.convertToContentRelationship(this.imageInfo.tagToPages, 'internalUniquePageName')
              }

              this.isMetadataEnable = true;
              this.quill && this.quill.enable(true);
          }
        }
        this.flags.isHaveImage = this.imageInfo.damId !== CLOUDINARY.DUMMY_IMAGE.PUBLIC_ID;
        this.currentRatio = this.flags.isHaveImage? this.currentRatio : 'original';
    }

    private getDefaultOptions(){
        return new ImageUploadWidgetOption();
    }

    /**
     * @description clear image from place holder and replace it with dummy image
     */
    clearImage() {
        this.setDummyImage();
        this.flags.isHaveImage = false;
        this.currentRatio = 'original';
        this.emitChange(null);
        this.changeDetectorRef.detectChanges();
    }

    emitChange(imageInfo){
        if(imageInfo) {
            const event = {...imageInfo};
            // TODO: remove this code when the page structure is refactored.
            if(this.persistSizes) {
              const { urlOriginal, url16_9, url16_16, url27_40 } = this.cloudinaryService.transformImageURL(
                  event.damId,
                  event.properties.fileType,
                  event.properties.version
              );

                event.sizes = {
                    original: urlOriginal,
                    portrait: url27_40,
                    landscape: url16_9,
                    square: url16_16,
                }
            }
            delete event.url16_9;
            delete event.url16_16;
            delete event.url27_40;

            this.imageChange.emit(event);
        } else {
            this.imageChange.emit(imageInfo);
        }
        this.setDefaultRatio();
    }

    setDummyImage() {
        const dummyImage = CLOUDINARY.DUMMY_IMAGE;
        const { urlOriginal, url16_9, url16_16, url27_40 } = this.cloudinaryService.transformImageURL(
            dummyImage.PUBLIC_ID,
            dummyImage.FILE_TYPE,
            dummyImage.VERSION
        );

        this.imageInfo = {
            damId: dummyImage.PUBLIC_ID,
            url: urlOriginal,
            url16_9: url16_9,
            url16_16: url16_16,
            url27_40: url27_40,
            isDefault: false,
            tagToPages: [],
            properties: {
                fileType: dummyImage.FILE_TYPE,
                version: dummyImage.VERSION
            },
            metadata: {
                description: '',
                sourceLabel: '',
                sourceLink: ''
            }
        };
        this.isMetadataEnable = false;
        this.quill && this.quill.enable(false); //first onChanges doesn't have quill yet. disabled by default
    }

    /**
     * @description open clear confirmation popup
     */
    openConfirmPopup() {
        this.confirmPopup.show();
    }

    onImageLoad(event, elem) {
        this.cloudinaryService
            .getImageTypeAndSize(elem.src)
            .subscribe((resp: any) => {
                elem.fileSize = this.fromBToKB(resp.size);
                elem.fileType = resp.type.replace(/image\//g, "").toUpperCase();
                this.changeDetectorRef.detectChanges();
            });
    }

    onEditorTextChanged(e: any) {
        if(this.isMetadataEnable && e.source === 'user'){ //event.source: Source of change. Will be either "user" or "api".
            this.imageInfo.metadata.description = e.htmlValue;
            this.onMetaDataChanged();
        }
    }

    onMetaDataChanged(){
        this.emitChange(this.imageInfo);
    }

    onInputChange(){
        if(this.imageInfo && this.imageInfo.damId !== CLOUDINARY.DUMMY_IMAGE.PUBLIC_ID){
            this.onMetaDataChanged();
        }
    }

    /**
     * @description Query all page matched parameters then fill to control.
     * @param { val: string, updateEvent: BehaviorSubject<any> } event object
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
     * @description Remove relationship between PageToTag and Article.
     * @param {*} data
     */
    onTagRemoved(data: any) {
        this.imageInfo.tagToPages = this.getTags().filter((val) => val.entityId != data.entityId);
        this.onMetaDataChanged();
    }

    /**
     * @description Request to create relationship
     * @param {*} page
     */
    onTagAdded(page: any) {
        this.getTags().push(page);
        this.onMetaDataChanged();
    }

    getTags(){
        this.imageInfo.metadata = this.imageInfo.metadata || {};
        this.imageInfo.tagToPages = this.imageInfo.tagToPages || [];
        return this.imageInfo.tagToPages;
    }

    convertToContentRelationship(listItem: any[], key) {
        const display = 'displayName';
        listItem.map((item, idx, ar) => {
            item[display] = item[key] || item[display];
            return item;
        });
        return listItem;
    }

    onClickSetDefaultButton(){
        this.setDefault.emit(true);
    }

    private fromBToKB(val: number) {
        return Math.round(val / 1024);
    }

    private onCollapsed(){
        this.isCollapsed = !this.isCollapsed;
        this.isCollapsedChange.emit(this.isCollapsed);
    }

    onChangeRatio(ratio){
        this.currentRatio = ratio;
    }

    isDisableRatio() {
      return this.title === 'Poster' || this.title === 'Cover' || this.title === 'Logo' ? true : null;
    }

    openSearchWidget() {
        if (this.uploaderId) {
            this.isUploadMultiple.emit(true);
        } else {
            this.searchWidget.showPopup();
        }
    }

    onSelectImage(e : any) {
      this.imageInfo = e;

      const { urlOriginal, url16_9, url16_16, url27_40 } = this.cloudinaryService.transformImageURL(
                  e.damId,
                  e.properties.fileType,
                  e.properties.version
      );

      this.imageInfo.url27_40 =  url27_40;
      this.imageInfo.url16_9 = url16_9;
      this.imageInfo.url16_16 = url16_16;

      this.isMetadataEnable = true;
      this.flags.isUploading = false;
      this.flags.isHaveImage = true;
      this.quill.enable(true);

      this.setDefaultRatio();

      this.imageChange.emit(e);
      this.changeDetectorRef.detectChanges();
    }

    getId(){
      if(this.imageInput){
        return this.imageInput.damId;
      }
      return 'upload-' + this.instanceId;
    }

    setDefaultRatio() {
      if (this.title && this.referenceRatio.get(this.title))
          this.currentRatio = this.referenceRatio.get(this.title);
        else
          this.currentRatio = this.options.defaultRatio;
    }
}
