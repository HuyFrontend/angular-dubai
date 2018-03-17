import { Injectable } from '@angular/core';
import { ContentService } from 'services';
import { Observable } from 'rxjs/Observable';
import { FormActions } from './form.state';
import { AlertsActions } from './alerts.state';
import { NgRedux } from '@angular-redux/store';
import { IContentState, IAppState, FormType } from './app-interfaces';
import { Content, RelationshipRequest, ContentRelationship, ParagraphImage, EntityRequest } from 'models';
import { NOTIFICATION_TYPE, VIEW_OPTIONS, PARAGRAPH_TYPE } from 'constant';

export abstract class BaseActions {
  private editingOrder: any;

  constructor(protected redux: NgRedux<IAppState>,
    protected alertsActions: AlertsActions,
    protected formActions: FormActions,
    protected contentService: ContentService) {
  }

  protected abstract updateRelationships(entityId: string) : Observable<any>;
  protected abstract saveEntity() : Observable<any>;

  protected getContent(): any {
      const { form: { values } } = this.redux.getState();
      return values;
  }

  protected getContentType = () => this.redux.getState().form.type;

  protected getEditingSession = () => this.redux.getState().form.editingSession;

  protected nextOrder = () => this.redux.getState().form['editingOrder'] + 1;

  public initSession(): Observable<any> {
      return this.contentService.initSession()
          .map(result=> {
              const { editingSession } = result;
              return editingSession;
          });
  }

  public cancelSession(): Observable<any> {
      return this.contentService
                  .cancelSession(this.getEditingSession());
  }

  public commit(showMessage: boolean = true): Observable<any> {
      return this.contentService
              .commit(this.getEditingSession())
              .map(x=> {
                if(showMessage){
                  this.alertsActions.show(NOTIFICATION_TYPE.SUCCESS, 'Saved successfully');
                }
              });
  }

  public resetForm() : void {
    this.formActions.resetForm();
  }

  public hasError(errors): boolean {
    if(!errors) return false;

    const keys = Object.keys(errors);
    for(let i=0; i<keys.length; i++) {
      if(errors[keys[i]] && errors[keys[i]].invalid) {
        return true;
      }
    }
    return false;
  }

}
