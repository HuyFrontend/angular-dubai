import { EntityStatus } from '../../../../core/models/entity.model';
import { ImageInfo } from 'models';
import { ImageUploadWidgetOption } from 'components/imageUploadWidget';
import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup } from '@angular/forms';
import { PhotoAlbumType, PhotoAlbum } from 'models';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { FormActions, PostActions, IAppState } from "state";
import { NgRedux } from '@angular-redux/store';


@Component({
    selector: 'image-post',
    templateUrl: 'image-post.html',
    styleUrls: ['image-post.scss']
})
export class ImagePostComponent {

    @Input() isFormSubmitted:boolean;
    @Input('parent-form-group') parentFormGroup: FormGroup;
    @Input() postStatus: EntityStatus;
    @Input() isRequiredAlbumTitle: boolean;
    @Input() featureOnStream: boolean;
    @Input() isReadOnly: boolean = false;
    @ViewChild('switchDataConfirmPopup') public switchDataConfirmPopup: MBCConfirmationComponent;

    constructor(private formActions: FormActions,
        protected redux: NgRedux<IAppState>,) {

    }

    onTabchange(tartgetAlbumType: PhotoAlbumType){
        const {type: currentAlbumType} = this.parentFormGroup.controls.image.value;
        //initial set tab active also trigger onTabChange, we dont want to handle that.
        if(currentAlbumType == tartgetAlbumType){
            return;
        }
        const images = this.parentFormGroup.controls.image.value.images;
        if((tartgetAlbumType == 'single' && images.length === 0)
            || (tartgetAlbumType == 'multiple')){
                this.switchTab(tartgetAlbumType, false);
        } else {
            this.switchDataConfirmPopup.show(tartgetAlbumType);
        }
    }

    onImageChange(formControl, image){
        const imageValue: PhotoAlbum = formControl.value;
        const albumImages = imageValue.images;
        albumImages.length = 0;
        if(image){
            image.isDefault = true;
            albumImages.push(image);
        }
        formControl.setValue(Object.assign(imageValue, { ...imageValue, images: albumImages}));

        const { form: { values: {paragraphs} }} = this.redux.getState();
        paragraphs[0].image.images = albumImages;
        this.formActions.updateFormValueByKey('paragraphs', paragraphs);
        this.formActions.updateExtraField({isFormChanged: true});
    }

    updateValueAndValidity() {
        const imageValue: PhotoAlbum = this.parentFormGroup.controls.image.value;
        this.parentFormGroup.controls.image.updateValueAndValidity();
        if(imageValue.images.length == 0){
            this.parentFormGroup.controls.image.setErrors({
                'required': true
            });


            const { form: { values: {paragraphs} }} = this.redux.getState();
        }

    }

    onFeatureOnStreamChange(event) {
        let { form: { values: {featureOnStream} }} = this.redux.getState();
        featureOnStream = event;
        this.formActions.updateFormValueByKey('featureOnStream', featureOnStream);
        this.formActions.updateExtraField({isFormChanged: true});
    }
    switchTab(albumType, isReuseData){
        const imageValue: PhotoAlbum = this.parentFormGroup.controls.image.value;
        this.parentFormGroup.controls.image.setValue(Object.assign(imageValue, {type: albumType}));
        imageValue.id = undefined;
        if(albumType == 'single') {
            if(isReuseData){
                const defaultImg = imageValue.images.find((e: ImageInfo) => e.isDefault);
                imageValue.images = defaultImg ? [defaultImg] : [];
            } else {
                imageValue.images = [];
            }
        }
    }

    onPhotoAlbumChange(formControl, photoAlbum: PhotoAlbum){
        formControl.setValue(photoAlbum);

        const { form: { values: {paragraphs} }} = this.redux.getState();
        paragraphs[0].image = photoAlbum;
        this.formActions.updateFormValueByKey('paragraphs', paragraphs);
        this.formActions.updateExtraField({isFormChanged: true});
    }
}
