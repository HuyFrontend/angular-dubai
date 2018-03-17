import { Component, OnInit, OnDestroy, SimpleChanges,
  OnChanges, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { select } from '@angular-redux/store';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Post, RelationshipRequest, ContentRelationship, CommentModel, PageSuggestionRequest } from 'models';
import { PostActions, ContentActions, IFormState, AlertsActions } from 'state';
import { PageService, ContentService, WorkflowService, AppConfigService } from 'services';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';
import { SingleParagraphFormComponent } from '../../components/singleParagraphForm';
import { notEmpty, emptyObject } from 'modules';
import {
  CONTENT_STATUS, FORM_STATE, CONTENT_TYPE,
  NOTIFICATION_TYPE, VIEW_OPTIONS, PARAGRAPH_TYPE, NOTIFICATION_MESSAGE,
  SORT_DIRECTION, PUBLISHING_LEVEL, MODERATE_ACTION, WORKFLOW_TASK
} from 'constant';
import { dateFormatter } from 'utils/formatters';
import * as format from 'string-format';
import { getDateFormat, sortByAnyField, getQueryParameter } from 'utils';
import { getInterestSuggestions, getAllInterestNode } from 'utils/config-helper';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

const PREVIEW_PREFIX = '/Pages/Preview_Page/Post';

@Component({
  selector: 'post-form',
  templateUrl: 'post-form.html'
})

export class PostFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() action: string;
  @ViewChild('confirmClose') public confirmClose: MBCConfirmationComponent;
  @ViewChild('confirmCopy') public confirmCopy: MBCConfirmationComponent;
  @ViewChild('paragraphComponent') public paragraphComponent: SingleParagraphFormComponent;
  @ViewChild('confirmPublishPopup') public confirmPublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmUnpublishPopup') public confirmUnpublishPopup: MBCConfirmationComponent;
  @ViewChild('confirmDeletePopup') public confirmDeletePopup: MBCConfirmationComponent;
  @ViewChild('confirmModeratePopup') public confirmModeratePopup: MBCConfirmationComponent;
  @ViewChild('confirmSaveAndPublishPopup') public confirmSaveAndPublishPopup: MBCConfirmationComponent;
  @ViewChild('showPreview') public showPreview: MBCConfirmationComponent;


  @select(['form', 'values']) postObservable: Observable<Post>;
  @select(['form', 'isFormChanged']) isFormChanged$: Observable<boolean>;
  private postSubscription: Subscription;

  public isFormChanged: boolean = false;

  public safePreviewUrl: SafeHtml;
  public post: Post;
  public entityGroup: FormGroup;
  public relationshipGroup: FormGroup;
  public listWebsite = [new ContentRelationship('relationShipId', 'entityId', 'mbc.net')];

  public listOfComments: Array<CommentModel> = [];
  public message = NOTIFICATION_MESSAGE;
  public dateFormatter = dateFormatter;
  public isFormSubmitted: boolean = false;

  private isSubmitting: boolean = false;
  private needReset: boolean = true;
  private originalTitle: string = '';
  private contentStatus:any = CONTENT_STATUS;
  private listTagPagesSelected: any[];
  private listInterestsSelected: any[];
  private isInternalCopy = false;
  private entityId: string;

  private commentSearch = {
      field: '',
      orderDir: SORT_DIRECTION.ASC
  };
  private isRequiredAlbumTitle: boolean = false;

  constructor(private postActions: PostActions,
    private pageService: PageService,
    private contentService: ContentService,
    private contentActions: ContentActions,
    private workflowService: WorkflowService,
    private alertsActions: AlertsActions,
    private router: Router,
    private configServive: AppConfigService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute){

    }

  ngOnInit() {
    this.postSubscription = this.postObservable.subscribe(post => {
      this.post = post;
      if(post.entityId || post.type === 'post') {
        if(this.originalTitle == '' && this.post.entityId){
          this.originalTitle = post.title;
        }
        this.bindStateToForm();
        this.getListOfComments();
      }
      this.entityId = post.entityId;
      if(this.route.snapshot.queryParams['copyFromId']){
        this.post.entityId = '';
      }
    });

    this.isFormChanged$.subscribe(isChanged => {
          this.isFormChanged = isChanged;
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

  getListOfComments(){
    if(!this.post || !this.post.entityId || this.isInternalCopy || getQueryParameter(this.router,'copyFromId')){
      return ;
    }
    this.workflowService.getListOfRejectComments(this.post.entityId, CONTENT_TYPE.POST)
                      .subscribe(result => {
                          this.listOfComments = result;
                      });
  }

  ngOnDestroy() {
    if(this.needReset) {
      this.postActions.resetForm();
      this.postSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
      if(changes.article) {
        this.bindStateToForm();
      }
  }

  confirmSaveAndPublish($event){
    this.confirmSaveAndPublishPopup.show();

  }

  onSaveAndPublish(){
    this.onSubmit(true);
  }

  onSubmit(isSaveAndPublish = false) {
    // Prevent double submmiting
    if(this.isSubmitting) {
      return;
    }

    this.isFormSubmitted = true;
    this.contentActions.beforeSubmitForm(true);
    this.entityGroup.controls.title.updateValueAndValidity();
    this.postActions.updateParagraphValidity();
    this.paragraphComponent.updateValueAndValidity();
    this.validatePostTitle(this.entityGroup.controls.title.value).subscribe(result => {
        if ( (this.postActions.isChanged() || isSaveAndPublish)
          && this.postActions.isFormValid()
          && this.entityGroup.valid
          && this.paragraphComponent.isValid()
          && this.relationshipGroup.controls.publishOnBehalf.status === FORM_STATE.VALID
          && this.contentActions.allFormValid()) {
            // Create entity first
            this.isSubmitting = true;

            if(this.route.snapshot.queryParams['copyFromId']){
              this.post.entityId = '';
            }
            this.postActions.saveEntity().subscribe(result => {
              this.entityId = this.post.entityId || result.entityId;
              if(isSaveAndPublish){
                this.publishContent(isSaveAndPublish);
              }
              if(this.isEditting()) {
                this.postActions.fetchPost(this.entityId);
              } else {
                  this.router.navigate([`/content/post/${this.entityId}`]);
              }
              this.originalTitle = this.entityGroup.controls.title.value;
              this.isInternalCopy = false;
              this.isSubmitting = false;
            }, error => this.isSubmitting = false);
        }
    });

  }

  isEditting() {
    return this.action === 'edit';
  }

  canShowPublishing() {
    return this.action === 'edit' &&
            this.post.status != CONTENT_STATUS.LIVE &&
            this.post.status != CONTENT_STATUS.READY &&
            this.post.status != CONTENT_STATUS.PENDING;
  }

  initialEntityGroup(): void {
    if(!this.entityGroup) {
      this.entityGroup = new FormGroup({
        featureOnStream: new FormControl(this.post.featureOnStream),
        language: new FormControl(this.post.language),
        title: new FormControl(this.post.title, [notEmpty()]),
        label: new FormControl(this.post.label),
        description: new FormControl(this.post.description)
      });
    }
  }

  initRelationshipGroup(): void {
    const publishOnBehalf = new FormControl(this.post.publishOnBehalf, [emptyObject()]);
    const websites = new FormControl(this.post.websites);
    const tagToPages = new FormControl(this.post.tagToPages);
    this.relationshipGroup = new FormGroup({
      publishOnBehalf,
      websites,
      tagToPages
    });
  }

  initialFormGroup(): void {
    this.initialEntityGroup();
    this.initRelationshipGroup();
  }

  bindStateToForm(): void {
    this.initialFormGroup();
    if (this.post) {
      const { controls: formControls } = this.relationshipGroup;
      Object.keys(formControls).map((key, idx, arr) => {
        const model = this.post;
        const isFormControlInstance = formControls[key] instanceof FormControl;
        if (model[key] && formControls[key] && isFormControlInstance) {
          formControls[key].setValue(model[key]);
        }
      });

      const interestsFromEdit = this.post.interests;
      if(interestsFromEdit){
        this.configServive.fetchInterestConfigs().subscribe((res: any)=>{
          this.listInterestsSelected = getAllInterestNode(res)
                                      .filter(x=> interestsFromEdit.filter(i=>i == x.id).length > 0);
        });
      }
    }
  }

  getPostTypeLabel(){
    if(this.post.paragraphs.length <=0){
      return '';
    }
    let typeLabel = '';
    switch(this.post.paragraphs[0].type) {
      case PARAGRAPH_TYPE.IMAGE:
        typeLabel = 'Image';
        break;
      case PARAGRAPH_TYPE.EMBEDDED:
        typeLabel = 'Link';
        break;
      case PARAGRAPH_TYPE.LIVE:
        typeLabel = 'Live';
        break;
      case PARAGRAPH_TYPE.TEXT:
      default:
        typeLabel = 'Text';
        break;
    }
    return typeLabel + ' Post';
  }

  convertToContentRelationship(listItem: any[], key) {
    const display = 'displayName';
    listItem.map((item, idx, ar) => {
      item[display] = item[key];
      return item;
    });
    return listItem;
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

  onQueryInterest({ val, updateEvent }){
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    this.configServive.fetchInterestConfigs().subscribe(x=>{
        const results = getInterestSuggestions(val, x, this.listInterestsSelected);
        _updateEvent.next(this.convertToContentRelationship(results, 'id'));
    });
  }

  onAddedInterest(interest: any) {
    if (interest) {
      this.postActions.addInterestToContent(interest);
    }
  }

  onInterestSelectedChanged(listSelected:any){
    this.listInterestsSelected = listSelected;
  }

  onRemoveInterest(obj: any) {
    if (obj) {
      this.postActions.removeInterest(obj);
    }
  }

  onQueryTagToPages({ val, updateEvent }) {
    const _updateEvent: BehaviorSubject<any> = updateEvent;
    let publishOnBehalfIds = [];
    let tagToPageIds = [];

    if(this.post.publishOnBehalf && this.post.publishOnBehalf.entityId){
      publishOnBehalfIds.push(this.post.publishOnBehalf.entityId);
    }

    if(this.listTagPagesSelected) {
      this.listTagPagesSelected.forEach( relation => tagToPageIds.push(relation.entityId));
    }

    this.pageService
      .suggest(new PageSuggestionRequest('tag', val, null, null, publishOnBehalfIds.concat(tagToPageIds)))
      .subscribe(listPage => {
        _updateEvent.next(this.convertToContentRelationship(listPage, 'internalUniquePageName'));
      });
  }

  onTagPagesSelectedChanged(listSelected:any){
    this.listTagPagesSelected = listSelected;
  }

  onPublishOnBehalfChanged(obj: any) {
    this.postActions.changePublishedToPage(obj);
  }

  onRemovePageTag(obj: any) {
    if (obj) {
      this.postActions.removeTagToPages(obj);
    }
  }

  onAddedTagToPage(page: any) {
    if (page) {
      this.postActions.addTagToPages(page);
    }
  }

  validatePostTitle(val: string): Observable<any> {
        if(this.originalTitle == val) {
            return Observable.create(obs => {
                obs.next();
                });
        }
        return this.contentActions.checkExistContentTitle(val);
    }

  onValidateTitle({target, val}) {
      if(this.originalTitle != val) {
          if(!val) return;
          if(val.trim().length > 0) {
              this.contentActions.checkExistContentTitle(val)
                  .subscribe();
          }
      }
    }

  onClose() {
      if (this.postActions.isChanged()) {
          this.confirmClose.show();
      } else {
          this.onReturnListPage();
      }
  }

  onReturnListPage() {
      this.postActions.cancelSession().subscribe();
      this.router.navigate(['content']);
  }

  copyPost() {
    this.needReset = false;
    const fromId = this.post.entityId;
    this.isInternalCopy = true;
    this.postActions.copyPost(fromId).subscribe(result => {
        this.router.navigate(['content', 'post'], { queryParams: { copyFromId: fromId } })
    });
  }

  onShowCopyModal() {
        if(this.postActions.isChanged()) {
            // check again.
            this.confirmCopy.show();
        } else {
            this.copyPost();
        }
    }

    onPublished() {
      this.confirmPublishPopup.show();
    }

    publishContent(isSaveAndPublish = false) {
      this.workflowService.publish(CONTENT_TYPE.POST, this.entityId, PUBLISHING_LEVEL.LEVEL4)
        .subscribe(res => {
          this.post.status = res.status;
          if(!this.entityId){
            this.entityId  = res.entityIdentifier.entityId;
          }
          let options = {
            currentStatus: res.status,
            targetStatus: CONTENT_STATUS.PENDING
          };

          this.workflowService.getStatusInterval((variables) => {
            this.post.status = variables.status;
            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Published'));
            if(isSaveAndPublish){
              this.router.navigate([`/content/post/${this.entityId}`]);
            }
          }, CONTENT_TYPE.POST, this.entityId, options);
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
      this.workflowService.executeWorkflow(CONTENT_TYPE.POST, this.post.entityId, WORKFLOW_TASK.MODERATE_ENTITY,
        {
          'moderateAction': $event.moderateAction,
          'comment': $event.comment
        })
        .subscribe(res => {
          this.post.status = res.status;

          let isReject: boolean = $event.moderateAction == MODERATE_ACTION.REJECT;
          let options = {
            currentStatus: res.status,
            targetStatus: isReject? CONTENT_STATUS.REJECTED : CONTENT_STATUS.LIVE
          };

          this.workflowService.getStatusInterval((variables) => {
            this.post.status = variables.status;
            this.post.publishedDate = variables.publishDate;

            this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
              format(NOTIFICATION_MESSAGE.ALERT_SUCCESS,
                (isReject? 'Rejected' : 'Approved')));
          }, CONTENT_TYPE.POST, this.post.entityId, options);
          this.getListOfComments();
        });
    }

    /**
     * Show Un-publish button if the post status is live
     */
    isShowUnpublishButton(){
        return this.action === 'edit' &&
            (this.post.status === CONTENT_STATUS.LIVE  ||
            this.post.status === CONTENT_STATUS.UPDATED)
    }

    /**
     * Show popup confirm to unpublish the post
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
     * Process Un-publish the post
     */
    onUnpublish() {
      this.workflowService.unpublish(CONTENT_TYPE.POST, this.post.entityId)
        .subscribe(res => {
          this.post.status = res.status;

          if (CONTENT_STATUS.UNPUBLISH === this.post.status) {
            let options = {
              currentStatus: CONTENT_STATUS.UNPUBLISH,
              targetStatus: CONTENT_STATUS.INACTIVE
            };

            this.workflowService.getStatusInterval((variables) => {
              this.post.status = variables.status;
              this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                  format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Un-published'));
            }, CONTENT_TYPE.POST, this.post.entityId, options);
          }
        });
    }

    /**
     * Process delete the post
     */
    onDelete() {
      this.workflowService.delete(CONTENT_TYPE.POST, this.post.entityId)
        .subscribe(res => {
            let options = {
              currentStatus: res.status,
              targetStatus: CONTENT_STATUS.DELETED
            };

            this.workflowService.getStatusInterval((variables) => {
              this.router.navigate([`/content`]).then(res => {
                this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS,
                                     format(NOTIFICATION_MESSAGE.ALERT_SUCCESS, 'Deleted'));
              });
            }, CONTENT_TYPE.POST, this.post.entityId, options);
        });
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

  isInactive() {
      return (this.post.status === CONTENT_STATUS.INACTIVE ? 'true' : null)
      || (this.post.status === CONTENT_STATUS.LIVE ? 'true' : null)
      || (this.post.status === CONTENT_STATUS.UPDATED ? 'true' : null);
  }
  /**
   * check photo album title
   */
  checkAlbumTitle (): boolean {
    let isRequiredTile = false;
    if (this.post && this.post.title && this.relationshipGroup
      && this.relationshipGroup.controls && this.relationshipGroup.controls.publishOnBehalf
      && this.relationshipGroup.controls.publishOnBehalf.status === FORM_STATE.VALID) {

      const paragraphs = this.post.paragraphs.filter((item)=>item.type === 'image');
      paragraphs.forEach((item) => {
        if(item['image'] && item['image']['images'] && item['image']['images'].length > 1 && !item['image']['title']) {
          isRequiredTile = true;
        }
      });
    }
    this.isRequiredAlbumTitle = isRequiredTile;
    return isRequiredTile;
  }
}
