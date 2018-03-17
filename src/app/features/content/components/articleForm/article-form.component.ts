import {
    Component, OnInit, SimpleChanges, OnChanges, EventEmitter,
    Input, Output, ViewChild, ChangeDetectionStrategy, ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormArray, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Location } from '@angular/common';
import {
    Article, RelationshipRequest, ContentRelationship, ImageInfo, CommentModel, PageSuggestionRequest
} from 'models';
import { ContentActions, IFormState, FormActions, AlertsActions } from 'state';
import { PageService, ContentService, WorkflowService, AppConfigService } from 'services';
import {
    CONTENT_STATUS, FORM_STATE, CONTENT_TYPE,
    NOTIFICATION_TYPE, VIEW_OPTIONS, PARAGRAPH_TYPE, NOTIFICATION_MESSAGE,
    SORT_DIRECTION, MODERATE_ACTION, WORKFLOW_TASK
} from 'constant';
import {DEBOUNCE_TIME} from 'configs';
import { getInterestSuggestions, getAllInterestNode } from 'utils/config-helper';
import { notEmpty, emptyObject } from 'modules';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { ParagraphFormComponent } from 'features/content/components/paragraphForm';

import { getDateFormat, sortByAnyField } from 'utils';
import * as format from 'string-format';
import { dateFormatter } from 'utils/formatters';
import { nospaceValidator } from 'utils/validator';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

const PREVIEW_PREFIX = '/Pages/Preview_Page/Article';

@Component({
    selector: 'article-form',
    templateUrl: 'article-form.html',
    styleUrls: ['article-form.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ArticleFormComponent implements OnInit, OnChanges {

    /**
     * Fetch all value from store.
     *
     */
    @select(['form', 'isFormChanged']) isFormChanged$: Observable<boolean>;
    @select(['form', 'entityId']) entityId$: Observable<string>;

    @Input() isCreate: boolean;
    @Input() article: Article;
    @Input() action: string;

    public safePreviewUrl: SafeHtml;
    public entityId: string;
    public isFormChanged: boolean = false;
    public isSubmitting: boolean;
    public isFormSubmitted: boolean; //use to show error message after user click save
    public dateFormatter = dateFormatter;
    public listInterestsSelected: any[];

    @ViewChild('confirmClose') public confirmClose: MBCConfirmationComponent;
    @ViewChild('confirmCopy') public confirmCopy: MBCConfirmationComponent;
    @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
    @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
    @ViewChild('paragraphFormComponent') public paragraphFormComponent: ParagraphFormComponent;
    @ViewChild('confirmModeratePopup') public confirmModeratePopup: MBCConfirmationComponent;
    @ViewChild('confirmSaveAndPublishPopup') public confirmSaveAndPublishPopup: MBCConfirmationComponent;
    @ViewChild('showPreview') public showPreview: MBCConfirmationComponent;

    public relationshipGroup: FormGroup;
    public entityGroup: FormGroup;
    public shouldValidate: boolean = false;
    // remaining features
    public listInterest: ContentRelationship[];
    public listWebsite: ContentRelationship[];
    public message = NOTIFICATION_MESSAGE;
    public listOfComments: Array<CommentModel> = [];
    public articlePhotoOptions;

    private isInternalCopy: boolean = false;
    private originalTitle: string = '';
    private isPreventUpdateForm:boolean = false;
    private forceRefresh = true;
    private contentStatus:any = CONTENT_STATUS;
    private isRequiredParagaph: boolean = false;
    private listTagPagesSelected: any[];

    private commentSearch = {
        field: '',
        orderDir: SORT_DIRECTION.ASC
    };


    public listParagraphOptions = [
        {
            label: 'Standard',
            value: VIEW_OPTIONS.STANDARD
        },
        {
            label: 'Numbered',
            value: VIEW_OPTIONS.NUMBERED
        },
        {
            label: 'Numbered Count Down',
            value: VIEW_OPTIONS.NUMBERED_COUNT_DOWN
        }
    ];
    public isHideCheckbox: boolean = false;
    constructor(
        private contentActions: ContentActions,
        private pageService: PageService,
        private contentService: ContentService,
        private workflowService: WorkflowService,
        private router: Router,
        private alertsActions: AlertsActions,
        private formActions: FormActions,
        private location: Location,
        private configServive: AppConfigService,
        private sanitizer: DomSanitizer) {
        // Fix temporary data for this sprint.
        this.listInterest = [];
        this.listWebsite = [new ContentRelationship('relationShipId', 'entityId', 'mbc.net')];
        this.articlePhotoOptions = { isRequired: true }

    }

    ngOnInit() {
        this.isFormChanged$.subscribe(isChanged => {
            this.isFormChanged = isChanged;
        });
        this.entityId$.subscribe(entityId => this.entityId = entityId);
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.article) {
            this.bindStateToForm();
            if(!this.originalTitle && !this.isCreate){
                this.originalTitle =  this.article.title;
            }
        }
    }

    getListOfComments(){
        if(!this.article || !this.article.entityId || this.isInternalCopy){
            return ;
        }
        this.workflowService.getListOfRejectComments(this.article.entityId, CONTENT_TYPE.ARTICLE)
                      .subscribe(result => {
                          this.listOfComments = result;
                      });
    }

    sort(field) {
        if (this.commentSearch.field !== field) {
            this.commentSearch.orderDir = SORT_DIRECTION.ASC;
        } else {
            this.commentSearch.orderDir = this.commentSearch.orderDir === SORT_DIRECTION.ASC ?
                                        SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;
        }
        this.commentSearch.field = field;
        this.listOfComments = sortByAnyField(this.listOfComments,
                                            this.commentSearch.field,
                                            this.commentSearch.orderDir);
    }

    convertToContentRelationship(listItem: any[], key) {
        const display = 'displayName';
        listItem.map((item, idx, ar) => {
            item[display] = item[key];
            return item;
        });
        return listItem;
    }

    onQueryInterest({ val, updateEvent }){
      const _updateEvent: BehaviorSubject<any> = updateEvent;
      this.configServive.fetchInterestConfigs().subscribe(x=>{
          const results = getInterestSuggestions(val, x, this.listInterestsSelected);
          _updateEvent.next(this.convertToContentRelationship(results, 'id'));
      });
    }

    onAddedInterest(interest: any) {
      if (interest) {
        this.contentActions.addInterestToContent(interest);
        if(this.article.entityId) {
          this.saveArticleEntity();
        }
      }
    }

    onInterestSelectedChanged(listSelected:any){
      this.listInterestsSelected = listSelected;
    }

    onRemoveInterest(obj: any) {
      if (obj) {
        this.contentActions.removeInterest(obj);
      }
    }

    onTagPagesSelectedChanged(listSelected:any){
        this.listTagPagesSelected = listSelected;
    }

    onQueryPublishOnBehalf({ val, updateEvent }) {
        const _updateEvent: BehaviorSubject<any> = updateEvent;
        let tagToPagesIds = [];
        if(this.listTagPagesSelected && this.listTagPagesSelected.length > 0){
            tagToPagesIds = this.listTagPagesSelected.map(x=>x.entityId);
        }
        this.pageService
            .suggest(new PageSuggestionRequest('publishOnBehalf', val, null, null, tagToPagesIds))
            .subscribe(listPage => {
                _updateEvent.next(this.convertToContentRelationship(listPage, 'internalUniquePageName'));
            });
    }
    public suggestionForTagToPages: any[];
    /**
     * Query all page matched parameters then fill to control.
     *
     * @param {any} { val: string, updateEvent: BehaviorSubject<any> }
     *
     * @memberOf ArticleFormComponent
     */
    onQueryTagToPages({val, updateEvent}) {
        const _updateEvent: BehaviorSubject<any> = updateEvent;
        let publishOnBehalfIds = [];
        let tagToPageIds = [];

        if(this.article.publishOnBehalf && this.article.publishOnBehalf.entityId){
            publishOnBehalfIds.push(this.article.publishOnBehalf.entityId);
        }

        if(this.article.tagToPages) {
          this.article.tagToPages.forEach( relation => tagToPageIds.push(relation.entityId));
        }

        this.pageService
            .suggest(new PageSuggestionRequest('tag', val, null, null, publishOnBehalfIds.concat(tagToPageIds)))
            .subscribe(listPage => {
                _updateEvent.next(this.convertToContentRelationship(listPage, 'internalUniquePageName'));
            });
    }

    onPublishOnBehalfChanged(data: any) {
        this.contentActions.updatePublishOnBehalfRelationship(data);
    }

    /**
     * Remove relationship between PageToTag and Article.
     *
     * @param {*} data
     *
     * @memberOf ArticleFormComponent
     */
    onRemovePageTag(data: any) {
        if (data) {
            data.parentPath = 'article';
            this.contentActions.removeTag2PageOfArticle(data);
        }
    }

    onAddedTagToPage(page: any) {
        if (page) {
            page.parentPath = 'article';
            this.relationshipChanged('tagToPages', page);
        }
    }

    relationshipChanged(type: string, data: any, isArray: boolean = false) {
        // check if articleId is not avaiable then add to queue for later task.
        data.type = type;
        if(this.article.entityId) {
            this.contentActions
            .createRelationship(this.article.entityId, type, data)
            .subscribe();
        } else {
            this.contentActions.addInQueue(type, data);
        }
    }

    saveArticleEntity(): void {
        this.isPreventUpdateForm = false;
        this.contentActions
            .saveArticleEntity()
            .subscribe(x=> {
                this.isPreventUpdateForm = true;
                this.forceRefresh = true;
            });
    }

    /**
     * Init Entity form group & bind data to controls.
     *
     *
     * @memberOf ArticleFormComponent
     */
    initialEntityGroup(): void {
        const entityGroup = new FormGroup({
            featureOnStream: new FormControl(this.article.featureOnStream),
            language: new FormControl(this.article.language),
            title: new FormControl(this.article.title, [Validators.required, nospaceValidator]),
            label: new FormControl(this.article.label),
            articlePhoto: new FormControl(this.article.articlePhoto, [Validators.required]),
            description: new FormControl(this.article.description),
            paragraphViewOption: new FormControl(this.article.paragraphViewOption)
        });
        this.entityGroup = entityGroup;
    }

    validateAllFields(): void {
        this.contentActions.validatePublishOnBehalf(this.article.publishOnBehalf);
        this.entityGroup.controls.articlePhoto.updateValueAndValidity();
        this.entityGroup.controls.title.updateValueAndValidity();
    }

    /**
     * Init Relationship form group & bind data to controls.
     *
     *
     * @memberOf ArticleFormComponent
     */
    initRelationshipGroup(): void {
        const listWebsite = [new ContentRelationship('relationShipId', 'entityId', 'mbc.net')];
        const publishOnBehalf = new FormControl(this.article.publishOnBehalf, [emptyObject()]);
        const websites = new FormControl(listWebsite);
        const tagToPages = new FormControl(this.article.tagToPages);
        const relationshipGroup = new FormGroup({
            publishOnBehalf,
            websites,
            tagToPages
        });
        this.relationshipGroup = relationshipGroup;
    }

    initialFormGroup(): void {
        if(Object.keys(this.article).length) {
            if(!this.entityGroup) {
                this.initialEntityGroup();
            }
            if(!this.relationshipGroup) {
                this.initRelationshipGroup();
            }
            if(this.forceRefresh) {
                this.bindValuesToFormGroup(this.entityGroup)
                this.bindValuesToFormGroup(this.relationshipGroup)
                this.forceRefresh = false;
            }
            this.getListOfComments();

            const interestsFromEdit = this.article.interests;
            if(interestsFromEdit){
              this.configServive.fetchInterestConfigs().subscribe((res: any)=>{
                this.listInterestsSelected = getAllInterestNode(res)
                                            .filter(x=> interestsFromEdit.filter(i=>i == x.id).length > 0);
              });
            }
            if ('status' in this.article && this.article['status'] === this.contentStatus.REJECTED) {
                this.isHideCheckbox = true;
            }
            if(this.entityId){
                this.saveArticleEntity();
            }
        }
    }

    bindValuesToFormGroup(formGroup: FormGroup) {
        const { controls: formControls } = formGroup;
        Object.keys(formControls).map((key, idx, arr) => {
            const model = this.article;
            const isFormControlInstance = formControls[key] instanceof FormControl;
            if (formControls[key] && isFormControlInstance) {
                formControls[key].setValue(model[key], {
                    onlySelf: true,
                    emitEvent: false
                });
            }
        });
    }

    bindStateToForm(): void {
        if(this.isPreventUpdateForm){
            return ;
        }
        this.initialFormGroup();
    }

    confirmSaveAndPublish($event){
        this.confirmSaveAndPublishPopup.show();
    }

    onSaveAndPublish(){
        this.onSubmit(true);
    }

    onSubmit(isSaveAndPublish = false) {
        // Prevent double submitting
        if(this.isSubmitting) {
          return;
        }
        this.isFormSubmitted = true;
        this.contentActions.beforeSubmitForm(true);
        this.validateAllFields();
        let validParagraphs =  this.paragraphFormComponent.validateParagraphs();
        if(!this.article.paragraphs || this.article.paragraphs.length <= 0){
            this.isRequiredParagaph = true;
            validParagraphs = false;
        }
        this.validateArticleTitle(this.entityGroup.controls.title.value)
        .subscribe(result => {
            if(this.isFormChanged || isSaveAndPublish) {
                if(this.contentActions.allFormValid() && validParagraphs &&
                this.relationshipGroup.controls.publishOnBehalf.status == FORM_STATE.VALID) {
                    this.isSubmitting = true;
                    // Check if the form is really changed.
                    this.contentActions
                        .commit(!isSaveAndPublish)
                        .subscribe(result=> {
                            this.isInternalCopy = false;
                            this.isSubmitting = false;
                            this.shouldValidate = false;
                            this.originalTitle =  this.entityGroup.controls.title.value;
                            this.isCreate = false;
                            if(isSaveAndPublish){
                                this.publishContent(isSaveAndPublish);
                            }
                            else{
                                this.router.navigate([`/content/article/${this.entityId}`]);
                            }
                        });
                }
            }
        }, error => this.isSubmitting = false);
    }

    onShowCopyModal() {
        if(this.isFormChanged) {
            // check again.
            this.confirmCopy.show();
        } else {
            this.onCopy();
        }
    }

    onLostFocusThenSaveArticle($event) {
        const { status } = this.entityGroup;
        if (status === FORM_STATE.VALID) {
            this.saveArticleEntity();
        } else {
            this.contentActions.updateFormGroupStatus('article_entity', status);
        }
    }
    validateArticleTitle(val: string): Observable<any> {
        if(this.originalTitle == val) {
            return Observable.of({});
        }
        return this.contentActions.checkExistContentTitle(val);
    }

    onValidateTitle({target, val}) {
        if(this.originalTitle != val) {
            if(!val) this.contentActions.updateFormGroupStatus('article_entity', FORM_STATE.INVALID);
            if(val.trim().length > 0) {
                this.validateArticleTitle(val)
                    .map(isValid => {
                        if(!isValid) {
                            const { status } = this.entityGroup;
                            if (status === FORM_STATE.VALID) {
                                this.saveArticleEntity();
                            }
                        }
                        return isValid;
                    })
                    .subscribe();
            }
        }
    }

    onCopy() {
        this.contentActions.copyArticle(this.article.entityId)
            .subscribe(entityId => {
                this.isInternalCopy = true;
                this.isPreventUpdateForm = false;
                this.forceRefresh = true;
                this.paragraphFormComponent.resetParagraphForm();
                this.listOfComments = [];
                this.isCreate = true;
                // do nothing.
                this.entityId = entityId;
                this.originalTitle = '';
                this.location.go(`/content/article/${entityId}`);
            });
    }

    /**
     * If any control in form was changed then show confirmation pop up,
     * Otherwise back to content list page.
     *
     *
     * @memberOf ArticleFormComponent
     */
    onClose() {
        if (this.isFormChanged) {
            this.confirmClose.show();
        } else {
            this.onReturnListPage();
        }
    }

    onReturnListPage() {
        this.contentActions.cancelSession()
            .subscribe();
        this.router.navigate(['content']);
    }

    isEditing() {
        return this.action === 'edit' &&  !this.isInternalCopy;
    }

    onPublished() {
      this.confirmPublishPopup.show();
    }

    publishContent(isSaveAndPublish = false) {
      this.workflowService.publish(CONTENT_TYPE.ARTICLE, this.entityId)
        .subscribe(res => {
            this.article.status = res.status;

            let options = {
                currentStatus: res.status,
                targetStatus: CONTENT_STATUS.PENDING
            };
            this.workflowService.getStatusInterval((variables) => {
                this.article.status = variables.status;
                this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
                if(isSaveAndPublish){
                    this.router.navigate([`/content/article/${this.entityId}`]);
                }
            }, CONTENT_TYPE.ARTICLE, this.entityId, options);
        });
    }

    onModeratePopup(moderateAction:string) {
        let message = '';
        if(moderateAction == 'approve'){
            message = 'Approval results in pushing content to front office sites. Do you want to proceed?';
        }
        if(moderateAction == 'reject'){
            message ='Rejection sends the content back to content publisher. Do you want to proceed?';
        }
        this.confirmModeratePopup.message = message;
        this.confirmModeratePopup.displayComment = (moderateAction == 'reject');
        this.confirmModeratePopup.show({'moderateAction': moderateAction});

    }

    onModerate($event: any) {

        let params = {
            moderateAction: $event.moderateAction,
            comment: $event.comment
        };

        this.workflowService.executeWorkflow(CONTENT_TYPE.ARTICLE, this.entityId, WORKFLOW_TASK.MODERATE_ENTITY, params)
            .subscribe(res => {
                this.article.status = res.status;
                let isReject: boolean = $event.moderateAction == MODERATE_ACTION.REJECT;
                let options = {
                    currentStatus: res.status,
                    targetStatus: isReject? CONTENT_STATUS.REJECTED : CONTENT_STATUS.LIVE
                };

                this.workflowService.getStatusInterval((variables) => {
                    this.article.status = variables.status;
                    this.article.publishedDate = variables.publishDate;

                    this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                        format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                            (isReject ? 'Rejected' : 'Approved')));
                }, CONTENT_TYPE.ARTICLE, this.entityId, options);
                this.getListOfComments();
            });
    }

    /**
     * Show Un-publish button if the article status is live
     */
    isShowUnpublishButton(){
        return this.action === 'edit' &&
            (this.article.status === CONTENT_STATUS.LIVE || this.article.status === CONTENT_STATUS.UPDATED)
    }

    /**
     * Show popup confirm to unpublish the article
     */
    confirmUnpublish($event) {
        this.confirmUnpublishPopup.show();
    }

    /**
     * Show popup confirm to delete the page
     */
    confirmDelete($event){
        this.confirmDeletePopup.show();
    }

    /**
     * Process Un-publish the article
     */
    onUnpublish() {
        this.workflowService.unpublish(CONTENT_TYPE.ARTICLE, this.article.entityId)
            .subscribe(res => {
                this.article.status = res.status;
                if (CONTENT_STATUS.UNPUBLISH === this.article.status) {
                    let options = {
                        currentStatus: CONTENT_STATUS.UNPUBLISH,
                        targetStatus: CONTENT_STATUS.INACTIVE
                    };

                    this.workflowService.getStatusInterval((variables) => {
                        this.article.status = variables.status;
                        this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                             format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-published'));
                    }, CONTENT_TYPE.ARTICLE, this.article.entityId, options);
                }
            });
    }

    /**
     * Process delete the article
     */
    onDelete() {
        this.workflowService.delete(CONTENT_TYPE.ARTICLE, this.article.entityId)
            .subscribe(res => {
                let options = {
                    currentStatus: res.status,
                    targetStatus: CONTENT_STATUS.DELETED
                };

                this.workflowService.getStatusInterval((variables) => {
                  this.router.navigate([`/content`]).then(res => {
                    this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                            format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                                            'Deleted'));
                  });
                }, CONTENT_TYPE.ARTICLE, this.article.entityId, options);
            });
    }

    isInactive() {
        return (this.article.status === CONTENT_STATUS.INACTIVE ? 'true' : null)
        || (this.article.status === CONTENT_STATUS.UPDATED ? 'true' : null)
        || (this.article.status === CONTENT_STATUS.LIVE ? 'true' : null);
    }

    onImageChange(formControl: FormControl, imageInfo: ImageInfo){
        formControl.setValue(imageInfo);

        const { status } = this.entityGroup;
        this.contentActions.updateFormGroupStatus('article_entity', status);
        this.formActions.updateFormControlByKey('articlePhoto', imageInfo, {
            ...formControl.errors,
            invalid: formControl.invalid
        });

        if (status === FORM_STATE.VALID) {
            this.saveArticleEntity();
        } else {
            //Show validity error message here
            // this.contentActions.updateFormGroupStatus('article_entity', status);
        }

    }

    onPreview() {
    let previewUrl: string = `${PREVIEW_PREFIX}/${this.entityId}?preview=true`;

    let previewTemplate: string = `
        <iframe frameborder="0" style="display: block; width: 100%; height: calc(100vh - 120px);"
                src='${previewUrl}'></iframe>
        `;
        this.safePreviewUrl = this.sanitizer.bypassSecurityTrustHtml(previewTemplate);
        this.showPreview.show();
    }
    onRemoveParagraph(event) {
        if (event) {
            this.saveArticleEntity();
        }
    }
}
