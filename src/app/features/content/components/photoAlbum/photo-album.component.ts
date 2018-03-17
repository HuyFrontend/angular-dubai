import { ImageUploadWidgetOption } from 'components/imageUploadWidget';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    NgZone,
} from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { PhotoAlbum, ImageInfo, PageSuggestionRequest } from 'models';
import { PageService, CloudinaryService } from 'services';
import { animations }  from './photo-album.animation'
import { DragulaService } from 'ng2-dragula';
import { findIndex } from 'lodash';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { ACTION_BUTTONS } from './photo-album.constant';
import { ImageUploadWidgetComponent } from 'components/imageUploadWidget';
import { SearchWidgetComponent } from 'components/searchWidget';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders, FileLikeObject } from 'ng2-file-upload';
import { CLOUDINARY } from 'constant';
@Component({
    selector: 'photo-album',
    templateUrl: 'photo-album.html',
    styleUrls: ['photo-album.scss'],
    animations: animations
})
export class PhotoAlbumComponent implements OnInit, OnChanges {

    @Input() photoAlbumInfo: PhotoAlbum;
    @Input() isFormSubmitted: boolean;
    @Input() isRequiredAlbumTitle: boolean;
    @Input() featureOnStream: boolean;
    @Input() isReadOnly: boolean = false;
    public flags: any;
    public imageControlDataArray: any[];
    public uploader: FileUploader;
    public errorUploading: string = '';
    public isShowInfo: boolean;

    private currentDragIndex: number;
    private responseImages = [];
    private DEFAULT_BUTTON_INDEX = 0;
    private FILES_SIZE_ERROR = 'Following images exceed limitation of 10 Mbs';

    @Output() albumChange: EventEmitter<PhotoAlbum> = new EventEmitter<PhotoAlbum>();
    @Output() featureOnStreamChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('switchDefaultImageConfirmPopup') public switchDefaultImageConfirmPopup: MBCConfirmationComponent;
    @ViewChild('deleteImageConfirmPopup') public deleteImageConfirmPopup: MBCConfirmationComponent;
    @ViewChild('deleteAllImageConfirmPopup') public deleteAllImageConfirmPopup: MBCConfirmationComponent;
    @ViewChild(ImageUploadWidgetComponent) public imageUploadWidget: ImageUploadWidgetComponent;
    @ViewChild(SearchWidgetComponent) searchWidget: SearchWidgetComponent;

    constructor(
        private pageService: PageService,
        private cloudinaryService: CloudinaryService,
        private changeDetectorRef: ChangeDetectorRef,
        private dragulaService: DragulaService,
        private zone: NgZone
        ) {
        const mockData = null;
        this.flags = {
            isUploading: false,
            isCollapsedAll: false
        };
        this.imageControlDataArray =[];
        this.isShowInfo = false;
    }

    ngOnInit() {
        this.dragulaService.drag.subscribe((value) => {
          const bagName = value[0];
          if(bagName == 'bag-one'){
            this.currentDragIndex = +value[1].getAttribute('image-index');
          }
        });

        this.dragulaService.drop.subscribe((value) => {
          const bagName = value[0];
          if(bagName == 'bag-one'){
            const siblingIndex = value[4] ? +value[4].getAttribute('image-index'): this.imageControlDataArray.length;
            const newIndex = siblingIndex > this.currentDragIndex ? siblingIndex-1: siblingIndex;
            const draggedItem = this.imageControlDataArray.splice(this.currentDragIndex,1)[0];
            this.imageControlDataArray.splice(newIndex, 0, draggedItem);

            this.imageControlDataArray.forEach((item, index, arr) => {
                this.fixImageControl(item, index, arr.length);
            });

            this.albumChange.emit(this.photoAlbumInfo);
            this.changeDetectorRef.detectChanges();
          }
        });
        this.initUploader();
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.photoAlbumInfo && changes.photoAlbumInfo.isFirstChange && this.photoAlbumInfo.images.length > 0){
            let defaultImageIndex = findIndex(this.photoAlbumInfo.images, (e: ImageInfo) => e.isDefault);
            defaultImageIndex =  defaultImageIndex >= 0 ? defaultImageIndex : 0;
            this.setImageControlData(this.photoAlbumInfo.images, defaultImageIndex);
        }
        this.showAlbumInfo();
    }

    ngAfterViewInit(){
    }

    initUploader(){
      this.uploader = this.cloudinaryService.getUploader(new ImageUploadWidgetOption());
      this.uploader.onSuccessItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
          this.upsertResponseItem({file: item.file, status, data: JSON.parse(response)});
      }

      this.uploader.onCompleteAll = () => {
        this.upsertResponse();
      }

      this.uploader.onErrorItem = (item, response, status, headers) => {
        this.errorUploading += '<p>' + item.file.name + ': ' + JSON.parse(response).error.message + '</p>';
      }

      this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) =>{
        switch (filter.name) {
          case 'fileSize':
              if(this.errorUploading.indexOf(this.FILES_SIZE_ERROR)<0){
                this.errorUploading += `<p>${this.FILES_SIZE_ERROR}:</p>`
              }
              this.errorUploading += `<p>${item.name}</p>`;
              break;
          default:
              this.errorUploading = `<p>${item.name} unknown error (${filter.name}) </p>`;
        }
      }

      this.uploader.onBeforeUploadItem = (fileItem) => {
        if(!this.uploader.isUploading){
          this.errorUploading = '';
        }
      };
    }

    upsertResponseItem(fileItem: any){
      this.zone.run(() => {
        if(fileItem.status){
          const existingId = this.responseImages.reduce((prev, current, index) => {
            if (current.file.name === fileItem.file.name && !current.status) {
              return index;
            }
            return prev;
          }, -1);
          if (existingId > -1) {
            this.responseImages[existingId] = Object.assign(this.responseImages[existingId], fileItem);
          } else {
            this.responseImages.push(fileItem);
          }
        }
      });
    }

    upsertResponse(){
      this.zone.run(() => {
        let defaultImageIndex = findIndex(this.photoAlbumInfo.images, (e: ImageInfo) => e.isDefault);
        const imageInfos: ImageInfo[] = [];

        this.responseImages.forEach((imageCloudinary, index) => {
            const urls = this.cloudinaryService.transformImageURL(
                imageCloudinary.data.public_id,
                imageCloudinary.data.format,
                imageCloudinary.data.version
            );

            const image: ImageInfo = {
                damId: imageCloudinary.data.public_id,
                url: urls.urlOriginal,
                isDefault: false,
                tagToPages: [],
                properties: {
                    fileType: imageCloudinary.data.format,
                    version: imageCloudinary.data.version
                },
                metadata: {
                    description: '',
                    sourceLabel: ''
                }
            };

            imageInfos.push(image);
            this.photoAlbumInfo.images.unshift(image);
        });
        this.showAlbumInfo();
        this.setImageControlData(imageInfos,
            (defaultImageIndex == -1 ) ? 0 : imageInfos.length + defaultImageIndex);
        this.flags.isUploading = false;
        this.albumChange.emit(this.photoAlbumInfo);
        this.changeDetectorRef.detectChanges();
        this.responseImages = [];

      });
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
        this.photoAlbumInfo.tagToPages = this.photoAlbumInfo.tagToPages.filter((val) => val.entityId != data.entityId);
        this.albumChange.emit(this.photoAlbumInfo);
    }

    /**
     * @description Request to create relationship
     * @param {*} page
     */
    onTagAdded(page: any) {
        this.photoAlbumInfo.tagToPages.push(page);
        this.albumChange.emit(this.photoAlbumInfo);
    }

    convertToContentRelationship(listItem: any[], key) {
        const display = 'displayName';
        listItem.map((item, idx, ar) => {
            item[display] = item[key];
            return item;
        });
        return listItem;
    }

    setImageControlData(images: ImageInfo[], defaultImageIndex: number){
        images.forEach((image, index, arr) => {
            const imageIndex = index;
            const {setDefaultButton, deleteImageButton} = this.getImageControlButtons(imageIndex);

            this.imageControlDataArray.unshift({
                isCollapsed: false,
                actionButtons: [ setDefaultButton, deleteImageButton ]
            });
        });

        this.imageControlDataArray.forEach((imageControl, index, arr) => {
            this.fixImageControl(imageControl, index, arr.length);
        });


        this.photoAlbumInfo.images[defaultImageIndex].isDefault = true;
        this.imageControlDataArray[defaultImageIndex].actionButtons[this.DEFAULT_BUTTON_INDEX].title = 'Default Image';
        this.imageControlDataArray[defaultImageIndex].actionButtons[this.DEFAULT_BUTTON_INDEX].style = {color: '#95b75c'};
        this.setDefaultImageControlData(defaultImageIndex);
    }

    getImageControlButtons(index){
        const setDefaultButton = {
                code: ACTION_BUTTONS.DEFAULT.CODE,
                title: ACTION_BUTTONS.DEFAULT.TITLE,
                fontAwesomeClass: 'fa-check-circle-o',
                callback: this.confirmSwitchDefaultImage.bind( this ),
                param: index,
                style: ACTION_BUTTONS.DEFAULT.STYLE
            },
            moveUpButton = {
                code: ACTION_BUTTONS.MOVE_UP.CODE,
                title: ACTION_BUTTONS.MOVE_UP.TITLE,
                fontAwesomeClass: 'fa-arrow-up',
                callback: this.moveImageUp.bind( this ),
                param: index,
                style: ACTION_BUTTONS.MOVE_UP.STYLE
            },
            moveDownButton = {
                code: ACTION_BUTTONS.MOVE_DOWN.CODE,
                title: ACTION_BUTTONS.MOVE_DOWN.TITLE,
                fontAwesomeClass: 'fa-arrow-down',
                callback: this.moveImageDown.bind( this ),
                param: index,
                style: ACTION_BUTTONS.MOVE_DOWN.STYLE
            },
            deleteImageButton = {
                code: ACTION_BUTTONS.DELETE.CODE,
                title: ACTION_BUTTONS.DELETE.TITLE,
                fontAwesomeClass: 'fa-times',
                callback: this.confirmDeleteImageControl.bind( this ),
                param: index,
                style: ACTION_BUTTONS.DELETE.STYLE
            };
        return { setDefaultButton, moveUpButton, moveDownButton, deleteImageButton };
    }

    moveImageUp(index){
        this.moveImageControl(index, true);
    }

    moveImageDown(index){
        this.moveImageControl(index, false);
    }

    moveImageControl(index, isMoveUp){
        const nextIndex = index + (isMoveUp ? -1 : 1);
        const temp1 = this.photoAlbumInfo.images[index];
        this.photoAlbumInfo.images[index] = this.photoAlbumInfo.images[nextIndex];
        this.photoAlbumInfo.images[nextIndex] = temp1;

        const temp2 = this.imageControlDataArray[index];
        this.imageControlDataArray[index] = this.imageControlDataArray[nextIndex];
        this.imageControlDataArray[nextIndex] = temp2;

        const numImage = this.imageControlDataArray.length;
        this.fixImageControl(this.imageControlDataArray[index], index, numImage);
        this.fixImageControl(this.imageControlDataArray[nextIndex], nextIndex, numImage);

        this.albumChange.emit(this.photoAlbumInfo);
    }

    fixImageControl(control, index, length){
        const { moveUpButton, moveDownButton } = this.getImageControlButtons(index);
        control.actionButtons = control.actionButtons.filter(button =>
            button.code !== ACTION_BUTTONS.MOVE_DOWN.CODE && button.code !== ACTION_BUTTONS.MOVE_UP.CODE);
        const deleteImageButton = control.actionButtons.pop();

        if(index !== 0){
            control.actionButtons.push(moveUpButton);
        }
        if(index !== length - 1){
            control.actionButtons.push(moveDownButton);
        }
        control.actionButtons.push(deleteImageButton);

        control.actionButtons.forEach(btn => btn.param = index);
    }

    confirmSwitchDefaultImage(index){
        if(!this.photoAlbumInfo.images[index].isDefault){
            this.switchDefaultImageConfirmPopup.show(index);
        }
    }

    setDefaultImage(index){
        this.photoAlbumInfo.images.forEach((item: ImageInfo) => item.isDefault = false);
        this.photoAlbumInfo.images[index].isDefault = true;
        this.setDefaultImageControlData(index);

        this.albumChange.emit(this.photoAlbumInfo);
    }

    setDefaultImageControlData(index){
        this.imageControlDataArray.forEach(item => {
            item.actionButtons[this.DEFAULT_BUTTON_INDEX].title = ACTION_BUTTONS.DEFAULT.TITLE;
            item.actionButtons[this.DEFAULT_BUTTON_INDEX].style = ACTION_BUTTONS.DEFAULT.STYLE;
        });

        this.imageControlDataArray[index].actionButtons[this.DEFAULT_BUTTON_INDEX].title = 'Default Image';
        this.imageControlDataArray[index].actionButtons[this.DEFAULT_BUTTON_INDEX].style = { color: '#95b75c' };
    }

    onImageChange(image, index){
        const oldImage = this.photoAlbumInfo.images[index];
        this.photoAlbumInfo.images[index] = Object.assign(oldImage, ...image);
        this.albumChange.emit(this.photoAlbumInfo);
    }

    confirmDeleteImageControl(index){
        this.deleteImageConfirmPopup.show(index);
    }

    onDeleteImageControl(index){
        const isNeedToResetDefault = this.photoAlbumInfo.images[index].isDefault;
        this.photoAlbumInfo.images.splice(index, 1);
        this.imageControlDataArray.splice(index, 1);

        if(this.photoAlbumInfo.images.length > 0){

            isNeedToResetDefault && this.setDefaultImage(0);

            //Reset action button param as the array is mutated
            this.imageControlDataArray.forEach((item, index, arr) => {
                this.fixImageControl(item, index, arr.length);
            });
        }
        this.showAlbumInfo();
        this.albumChange.emit(this.photoAlbumInfo);
    }

    confirmDeleteAllImageControl(){
        this.deleteAllImageConfirmPopup.show();
    }

    onDeleteAllImageControl(){
        this.photoAlbumInfo.images = []
        this.imageControlDataArray = [];

        this.showAlbumInfo();
        this.albumChange.emit(this.photoAlbumInfo);
    }

    onCollapseExpandAll(){
        this.flags.isCollapsedAll = !this.flags.isCollapsedAll;
        this.imageControlDataArray.forEach(imageControl => imageControl.isCollapsed = this.flags.isCollapsedAll);
    }

    onImageCollapseChange($event, index){
        this.imageControlDataArray[index].isCollapsed = $event;
        this.flags.isCollapsedAll = this.imageControlDataArray.find(imageControl => !imageControl.isCollapsed) === undefined;
    }

    onEditorTextChanged(e: any){
      if(e.source === 'user'){ //event.source: Source of change. Will be either "user" or "api'".
        this.photoAlbumInfo.description = e.htmlValue;
        this.albumChange.emit(this.photoAlbumInfo);
      }
    }

    onTitleChanged(){
        this.albumChange.emit(this.photoAlbumInfo);
    }
    /**
     * check if album has more than 1 pic, then show title, tag, and desc of album else hide them
     */
    showAlbumInfo () {
        const imageArray = (this.photoAlbumInfo && this.photoAlbumInfo.images) ? this.photoAlbumInfo.images : [];
        if (imageArray.length <= 1) {
            this.photoAlbumInfo.title = '';
            this.photoAlbumInfo.tagToPages = [];
            this.photoAlbumInfo.description = '';
            this.isShowInfo = false;
            this.photoAlbumInfo.type = 'single';
        } else {
            this.isShowInfo = true;
            this.photoAlbumInfo.type = 'multiple';
        }
    }
    /**
     * change feature on this stream
     *
     */
    changeStream() {
        this.featureOnStreamChange.emit(this.featureOnStream);
    }

    /**
     * trigger event upload multiple images / or esixting multiple
     */
    onUploadMultipleImages() {
        this.searchWidget.showPopup();
    }

    /**
     * on selected imageInfo list from DAM
     */
    onSelectedList(imageList) {
        let defaultImageIndex = findIndex(this.photoAlbumInfo.images, (e: ImageInfo) => e.isDefault);
        imageList.forEach((imageInfo) => {
            this.photoAlbumInfo.images.unshift(imageInfo);
        });
        this.showAlbumInfo();
        this.setImageControlData(imageList, (defaultImageIndex == -1 ) ? 0 : imageList.length + defaultImageIndex);
        this.flags.isUploading = false;
        this.albumChange.emit(this.photoAlbumInfo);
        this.changeDetectorRef.detectChanges();
        this.searchWidget.hidePopup();
    }
}
