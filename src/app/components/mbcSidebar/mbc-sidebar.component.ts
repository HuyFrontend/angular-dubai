import { Component, ViewEncapsulation } from '@angular/core';
import { select } from '@angular-redux/store';
import { LayoutActions } from 'state';

@Component({
  selector: 'mbc-sidebar',
  templateUrl: 'mbc-sidebar.html',
  styleUrls: ['mbc-sidebar.scss']
})

export class MBCSideBar {
  @select(['layout', 'isMenuCollapsed']) isMenuCollapsed: boolean;
  @select(['layout', 'isCreateNewCollapsed']) isCreateNewCollapsed: boolean;
  @select(['layout', 'isLoggedIn']) isLoggedIn: boolean;
  @select(['authUser', 'displayName']) displayName: string;
  @select(['authUser', 'email']) email: string;
  @select(['authUser', 'picture']) picture: string;
  public sidebarHeight: number = window.innerHeight;
  public isCollapsed: boolean = false;
  
  constructor(private layoutActions: LayoutActions) {}
  
  onResize($event) {
    this.sidebarHeight = window.innerHeight;
  }
  public toggleMenu() {
    this.layoutActions.toggleLeftSideBar();
    // Return false for preventing navigate page by <a> tag
    return false;
  }
  
  public toggleCreateNew(flag) {
    this.layoutActions.toggleCreateNewSideBar(flag);
    return false;
  }
}
