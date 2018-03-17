import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from 'ngx-webstorage';

import { getEndpoint } from 'configs';
import { CONTENT_TYPE, WORKFLOW_TASK, PUBLISHING_LEVEL} from 'constant';
import { PageModel, CommentModel } from 'models';
import { rejectNoteTooltip } from 'utils';
/**
 * Manipulate all configs from server
 * PageService
 */

@Injectable()
export class WorkflowService {
    private startEndpoint: string = '/workflows/starting/'
    private statusEndpoint: string = '/workflows/variables/'
    private taskEndpoint: string = '/workflows/task';
    private historyTaskEndpoint: string = '/workflows/history/tasks';
    private bulkTaskEndpoint: string = '/workflows/bulk-tasks';
    private bulkVariablesEndpoint: string = '/workflows/bulk-variables.query';
    private bulkStatusEndpoint: string = '/workflows/bulk-status.query';

    private const

    constructor(
        private http: Http,
        private localStorageService: LocalStorageService) {
    }

    executeWorkflow(entityType:string, entityId: string, task: string, parameters: any) {
      let url = getEndpoint(this.taskEndpoint);
        const req = {
            task,
            parameters,
            entityIdentifier: {
                entityId,
                entityType
            }
        };
        return this.http.put(url, req).map(x=> x.json());
    }

    executeWorkflows(entityIdentifiers: any[], task: string, parameters: any) {
        let url = getEndpoint(this.bulkTaskEndpoint);
        const req = {
            task,
            parameters,
            entityIdentifiers
        };
        return this.http.put(url, req).map(x=> x.json());
    }

    // TODO : should move publishing level into server-side
    publish(entityType, entityId: string, level:number = PUBLISHING_LEVEL.LEVEL4) {
        return this.executeWorkflow(entityType, entityId, WORKFLOW_TASK.ACTIVE_ENTITY, { publishLevel: level });
    }

    unpublish(entityType, entityId: string) {
        return this.executeWorkflow(entityType, entityId, WORKFLOW_TASK.UNPUBLISH_ENTITY, {});
    }

    // TODO : should move publishing level into server-side
    publishBulk(entityIdentifiers: any[], level:number = PUBLISHING_LEVEL.LEVEL4) {
        let url = getEndpoint(this.bulkTaskEndpoint);
        const req = {
            task: WORKFLOW_TASK.ACTIVE_ENTITY,
            parameters: {
                publishLevel: level
            },
            entityIdentifiers
        };
        return this.http.put(url, req).map(x=> x.json());
    }

    unpublishBulk(entityIdentifiers: any[]) {
        let url = getEndpoint(this.bulkTaskEndpoint);
        const req = {
            task: WORKFLOW_TASK.UNPUBLISH_ENTITY,
            parameters: {},
            entityIdentifiers
        };
        return this.http.put(url, req).map(x=> x.json());
    }

    getStatus(entityType: string, entityId: string): Observable<any> {
        let url = getEndpoint(this.statusEndpoint);
        return this.http.get(`${getEndpoint(this.statusEndpoint)}?entityType=${entityType}&entityId=${entityId}`);
    }

    getBulkStatus(entityIdentifiers: any[]): Observable<any>{
        let url = getEndpoint(this.bulkStatusEndpoint);
        return this.http.post(url, entityIdentifiers);
    }

    getBulkVariables(entityIdentifiers: any[]): Observable<any>{
      let url = getEndpoint(this.bulkVariablesEndpoint);
      return this.http.post(url, entityIdentifiers);
    }

    getListOfRejectComments(entityId: string, entityType: string): Observable<CommentModel[]> {
        let url = getEndpoint(this.historyTaskEndpoint);
        const req = {
            task: WORKFLOW_TASK.MODERATE_ENTITY,
            parametersEqualCriteria:
                {moderateAction : 'reject'}
            ,
            entityIdentifier:
                {
                    entityType,
                    entityId
                }
        };
        return this.http.post(url,req ).map(p => this.convertCommentToModel(p));
    }

    convertCommentToModel(results: any):CommentModel[] {
      return results.map(x=>this.mapCommentModel(x));
    };

    mapCommentModel(model: any): CommentModel {
      const comment = model.parameters.comment;
      return {
        comment:comment.length > 100 ? comment.substring(0, 100) + '...' : comment,
        rejectedDate: model.finishedDateTime,
        tooltipContent: rejectNoteTooltip(comment, model.finishedDateTime)
      };
    };

    getStatusInterval(callback, entityType: string, entityId: string, options?) {
        let actualOptions = Object.assign({}, {
            interval: 1500,
            maxInterval: 5,
            currentStatus: '',
            targetStatus: ''
        }, options);

        var counter = 0;
        let variables = {
          status: actualOptions.currentStatus
        };
        var scheduler = setInterval(() => {
            counter++;
            this.getStatus(entityType, entityId).subscribe(res => variables = res.variables);
            if (variables.status === actualOptions.targetStatus || counter === actualOptions.maxInterval) {
                callback(variables);
                clearInterval(scheduler);
            }
        }, actualOptions.interval);

    }

    getBulkStatusInterval(callback, entityIdentifiers: any[], options?) {
        let actualOptions = Object.assign({}, {
            interval: 1500,
            maxInterval: 5,
            currentStatus: [],
            targetStatus: ''
        }, options);

        var counter:number = 0,
            result: any,
            stopInterval: boolean = false;

        var scheduler = setInterval(() => {
            counter++;

            this.getBulkStatus(entityIdentifiers).subscribe(res =>{
                stopInterval = res.filter(p => Array.of(options.currentStatus).some(i => i === p.status)).length === 0;
                result = res;
            });

            if (stopInterval || counter === actualOptions.maxInterval) {
                callback(result);
                clearInterval(scheduler);
            }
        }, actualOptions.interval);
    }

    getBulkVariablesInterval(callback, entityIdentifiers: any[], options?) {
      let actualOptions = Object.assign({}, {
          interval: 1500,
          maxInterval: 5,
          currentStatus: [],
          targetStatus: ''
      }, options);

      var counter:number = 0,
          result: any,
          stopInterval: boolean = false;

      var scheduler = setInterval(() => {
          counter++;

          this.getBulkVariables(entityIdentifiers).subscribe(res =>{
              stopInterval = res.filter(p => Array.of(options.currentStatus).some(i => i === p.variables.status)).length === 0;
              result = res;
          });

          if (stopInterval || counter >= actualOptions.maxInterval) {
              callback(result);
              clearInterval(scheduler);
          }
      }, actualOptions.interval);
  }

    /**
     * Invoke workflow to delete the entity
     * @param entityType the type of the entity
     * @param entityId the id of the entity
     */
    delete(entityType, entityId: string) {
        return this.executeWorkflow(entityType, entityId, WORKFLOW_TASK.DELETE_ENTITY, {});
    }

    /**
     * Invoke workflow to delete bulk of the entities
     * @param entityIdentifiers
     */
    deleteBulk(entityIdentifiers: any[]) {
        let url = getEndpoint(this.bulkTaskEndpoint);
        const req = {
            task: WORKFLOW_TASK.DELETE_ENTITY,
            parameters: {},
            entityIdentifiers
        };
        return this.http.put(url, req).map(x=> x.json());
    }
}
