import { Component, ViewChild, AfterViewInit, OnInit, OnChanges, SimpleChanges,OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { AppTasksComponent } from 'features/apps/components/appTasks';
import { AppActions } from 'state/apps.state';
import { App } from 'models/app.model';
import { AppInfo } from 'models/app';
import { AppTabInfoComponent } from 'features/apps/components/infoTab';

@Component({
  selector: 'app-detail',
  templateUrl: 'app-detail.html',
  styleUrls: ['app-detail.scss']
})

export class AppDetailComponent implements OnInit, OnChanges,OnDestroy {

  @ViewChild('appTasks') appTasks: AppTasksComponent;
  @ViewChild('infoTab') infoTab: AppTabInfoComponent;
  @select(['forms', 'app']) app$: Observable<App>;

  private appId: string;
  private app: App = new App();

  constructor(
    private route: ActivatedRoute,
    private appActions: AppActions) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.appId = params['entityId'];
      if (this.appId) {
        this.appActions.fetchAppById(this.appId);
      } else {
        this.appActions.resetAppState();
      }
    });
  }

  ngOnDestroy() {
    this.appActions.resetAppState();
}

  ngOnChanges(changes: SimpleChanges) {}

  isValid(): boolean {
   return this.infoTab.isValid(this.isSubmitting());
  }

  isSubmitting(){
    return this.appTasks.isSubmitting();
  }

  isDirty(): boolean {
    return this.infoTab.isDirty();
  }
}
