import { InfoPageGroupsComponent } from './infoPageGroups';
import { InfoComponentProfileData } from '../infoComponentProfile/info-component-profile.model';
import { InfoComponentProfileComponent } from '../infoComponentProfile';
import { PageSetting, InfoComponent, InfoPageGroup, PageInfo, PageGroup } from 'models';
import { InfoComponentDragDropButton, InfoComponentType } from './page-tab-infocomponents.model';
import { AfterViewInit, SimpleChanges, Component, EventEmitter, Input, OnChanges, OnInit, Output, ChangeDetectorRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { DRAG_DROP_BUTTONS } from './page-tab-infocomponents.constant';
import { PageGroupService } from 'services';
import { PAGE_GROUP_STATUS } from 'constant';
import { MBCConfirmationComponent } from 'components/mbcConfirmation';

@Component({
  selector: "page-tab-infocomponents",
  styleUrls: ["page-tab-infocomponents.scss"],
  templateUrl: "page-tab-infocomponents.html"
})
export class PageTabInfoComponentsComponent implements OnInit, OnChanges, AfterViewInit {

  /** Entity Id of current Page */
  @Input() pageEntityId: string;
  /** Info of current Page */
  @Input() info: PageInfo;
  /** Is Page Form Submitted */
  @Input() isFormSubmitted: boolean;
  /** List Info Component of Page */
  @Input() infoComponents: InfoComponent[];
  /** Page Group that this current Page belong to */
  @Input() pageGroup: PageGroup;

  /** Trigger when there're any change in model */
  @Output() modelChanged = new EventEmitter<InfoComponent[]>();

  /** Info Component type PageGroup */
  @ViewChildren(InfoPageGroupsComponent) pageGroupICs:QueryList<InfoPageGroupsComponent>;
  /** Info Component type Profile */
  @ViewChildren(InfoComponentProfileComponent) profileICs:QueryList<InfoComponentProfileComponent>;

  /** Deletion Confirmation Popup */
  @ViewChild('confirmRemovalPopup') public confirmRemovalPopup: MBCConfirmationComponent;

  public infoComponentsUpper;
  public infoComponentsLower;
  public infoComponentTypes: InfoComponentDragDropButton[];
  public dragDropOptions;

  private CLASSLIST = {
    UPPER_BRACKET: 'upper-bracket',
    LOWER_BRACKET: 'lower-bracket',
    IC_TYPE_BRACKET: 'ic-type-bracket'
  };
  private savedPageGroupIC: InfoComponent;

  constructor(
    private dragulaService: DragulaService,
    private pageGroupService: PageGroupService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.infoComponentsUpper = [];
    this.infoComponentsLower = [];

    this.infoComponentTypes = this.getDragDropButtons();
    this.dragDropOptions = this.getDragDropOptions();
  }

  ngOnInit() {
    this.dragulaService.drop.subscribe((value) => { this.onItemDropped(value)});
  }

  /**
   * Trigger first when we have !!changes.infoComponents
   * @param changes changes of @Input
   */
  ngOnChanges(changes: SimpleChanges) {
    const icValues: InfoComponent[] = changes.infoComponents ? changes.infoComponents.currentValue : this.infoComponentsUpper.concat(this.infoComponentsLower);
    const pageGroupIC = icValues.find(val => val.type === 'pageGroup');

    if(changes.infoComponents){
      this.infoComponentsUpper = icValues.filter(val => val.aboveMetadata);
      this.infoComponentsLower = icValues.filter(val => !val.aboveMetadata);
      this.disablePageGroupButton(!!pageGroupIC && !this.pageGroup);
    }

    if(changes.pageGroup){
      //Page Group data in first change = Page Group Data that saved in server (update) or null (create)
      if(changes.pageGroup.firstChange){
        this.savedPageGroupIC = pageGroupIC; //save for later change Page Group in tab Info

        if(this.isALivePageGroup(this.pageGroup)){
          this.pageGroupService.getListPagesFromPageGroup(this.pageGroup.pageGroupId)
            .subscribe((pages: Array<any>) => {
              if(pages.length > 1){
                this.disablePageGroupButton(!!pageGroupIC);
              } else {
                this.disablePageGroupButton(true);
              }
            });
        } else{
          this.disablePageGroupButton(true);
        }

      } else {
        //Second change => update IC type Page Group if have any
        this.onPageGroupChanged(icValues);
      }
    }
  }

  ngAfterViewInit() {}

  private onPageGroupChanged(infoComponents){
    let pageGroupICIndexUpper = this.infoComponentsUpper.findIndex(val => val.type === 'pageGroup');
    let pageGroupICIndexLower = this.infoComponentsLower.findIndex(val => val.type === 'pageGroup');

    //remove current IC type Page group no matter what
    if(~pageGroupICIndexUpper){
      this.infoComponentsUpper.splice(pageGroupICIndexUpper, 1);
    } else if(~pageGroupICIndexLower){
      this.infoComponentsLower.splice(pageGroupICIndexLower, 1);
    }


    if(this.savedPageGroupIC && this.isALivePageGroup(this.pageGroup)
      && (<InfoPageGroup> this.savedPageGroupIC.data).pageGroup.entityId === this.pageGroup.pageGroupId){

      //re-add savedPageGroupIC, put to upper bracket by default
      this.savedPageGroupIC.aboveMetadata = true;
      this.infoComponentsUpper.unshift(this.savedPageGroupIC);
      this.disablePageGroupButton(true);
    } else if(this.isALivePageGroup(this.pageGroup)){
      //Check if pageGroup have more than 1 page
      this.pageGroupService.getListPagesFromPageGroup(this.pageGroup.pageGroupId)
        .subscribe((pages: Array<any>) => {
          if(pages.length > 1){

            //Page's assigned to another Page Group. We then call service to check if this new Page Group have IC type Page Group or not
            this.pageGroupService.isHaveInfoComponent(this.pageGroup.pageGroupId)
              .subscribe( isHaveInfoComponent => {
                if(isHaveInfoComponent){  //only care when it have info component
                  this.infoComponentsUpper.unshift({ type: 'pageGroup', aboveMetadata: true });
                }
                this.disablePageGroupButton(isHaveInfoComponent);

                this.changeDetectorRef.markForCheck();
              });
          } else {  //only 1 page in Page Group, should not allow to create Page Group IC
            this.disablePageGroupButton(true);
            this.changeDetectorRef.markForCheck();
          }
        });
    } else if(!this.pageGroup){
      //emit infoComponents that removed PageGroupIC already;
      this.disablePageGroupButton(true);
      this.onInfoComponentsChange();
    }
    this.changeDetectorRef.markForCheck();
  }

  private getDragDropButtons() {
    const result = [];
    DRAG_DROP_BUTTONS.forEach(btn => {
      const item = Object.assign({}, btn)

      if(item.type === 'pageGroup'){
        item.isDisabled = true;
      }

      result.push(item);
    });
    return result;
  }

  private disablePageGroupButton(isDisable: boolean){
    const pgBtn = this.infoComponentTypes.find(btn => btn.type === 'pageGroup');
    pgBtn.isDisabled = isDisable;
  }

  private getDragDropOptions(){
    return {
      revertOnSpill: true,
      copy: function (el, source) {
        return el.className === 'drag-drop-btn';
      },
      moves: (el, source, handle, sibling) => {
        return !el.classList.contains('disabled');
      }
    };
  }

  private onItemDropped(value){
    // el, target, source, sibling
    const bagId = value[0],
      el = value[1],
      target = value[2],
      source = value[3],
      sibling = value[4],
      isUpperBracket = target.classList.contains(this.CLASSLIST.UPPER_BRACKET);

    let targetICIndex;
    if (sibling) { //intermediate child
      targetICIndex = +sibling.getAttribute('icIndex');
    } else { //last child
      targetICIndex = isUpperBracket ? this.infoComponentsUpper.length : this.infoComponentsLower.length
      targetICIndex -= 1;
    };
    if (bagId == 'bag-ic') {
      if (source.classList.contains(this.CLASSLIST.IC_TYPE_BRACKET)) {
        //Check and create coresponding Info Component here
        const icType = el.getAttribute('icType');

        if (isUpperBracket) {
          this.infoComponentsUpper[targetICIndex] = { type: icType, aboveMetadata: true };
        } else {
          this.infoComponentsLower[targetICIndex] = { type: icType, aboveMetadata: false };
        }

        if(icType == "pageGroup") {
          this.disablePageGroupButton(true);
        }
      } else {
        //Move between upper/lower bracket
        if (isUpperBracket) {
          this.infoComponentsUpper[targetICIndex].aboveMetadata = true;
        } else {
          this.infoComponentsLower[targetICIndex].aboveMetadata = false;
        }
      }
      this.changeDetectorRef.markForCheck();
    }
  }

  onItemChange(data: any, index, isUpper: boolean){
    this.getBracket(isUpper)[index].data = data;
    this.onInfoComponentsChange();
  }

  onInfoComponentsChange(){
    //update state here
    this.infoComponents = this.infoComponentsUpper.concat(this.infoComponentsLower);
    console.log('onInfoComponentsChange', this.infoComponents);
    this.modelChanged.emit(this.infoComponents);
  }

  getBracket(isUpper: boolean){
    return isUpper ? this.infoComponentsUpper : this.infoComponentsLower;
  }

  removeActionComponent(index: number, isUpper: boolean){
    this.confirmRemovalPopup.show({index, isUpper});
  }

  onConfirmRemovingActionComponent({index, isUpper}){
    this.getBracket(isUpper).splice(index, 1);

    const pg = this.infoComponentsUpper.concat(this.infoComponentsLower).find(val => val.type === 'pageGroup');
    let isHavePageGroupIC = !!pg;
    this.disablePageGroupButton(isHavePageGroupIC || false);

    this.onInfoComponentsChange();
  }

  isALivePageGroup(pageGroup){
    return pageGroup && pageGroup.status === PAGE_GROUP_STATUS.LIVE;
  }

  moveUpActionComponent(index: number, isUpper: boolean){
    const temp = this.getBracket(isUpper)[index];
    this.getBracket(isUpper)[index] = this.getBracket(isUpper)[index - 1];
    this.getBracket(isUpper)[index - 1] = temp;
    this.onInfoComponentsChange();
  }

  moveDownActionComponent(index: number, isUpper: boolean){
    const temp = this.getBracket(isUpper)[index];
    this.getBracket(isUpper)[index] = this.getBracket(isUpper)[index + 1];
    this.getBracket(isUpper)[index + 1] = temp;
    this.onInfoComponentsChange();
  }

  isValid(){
    const infoComponenViews: any = this.profileICs.toArray()
                            .concat(this.profileICs.toArray());

    const invalidItem =  infoComponenViews.find(view => !view.isValid());

    return !invalidItem;
  }
}
