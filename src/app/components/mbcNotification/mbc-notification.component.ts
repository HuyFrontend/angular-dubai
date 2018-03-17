import { Component, OnInit, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { NOTIFICATION_TYPE, NOTIFICATION_MODE } from 'constant';
import { AlertsActions, Notification } from 'state';

import { Message } from 'primeng/primeng';
import * as iziToast from 'izitoast';

@Component({
  selector: 'mbc-notification',
  styleUrls: ['mbc-notification.scss'],
  templateUrl: 'mbc-notification.html',
  encapsulation: ViewEncapsulation.None
})

export class MBCNotificationComponent {

  @select(['alerts', 'notifications']) notifications: Observable<any>;
  public listNotifications: any[];
  public listStickyNotification: Notification[];

  public defaultConfig = {
    position: 'bottomCenter',
    timeout: 2000,
    icon: 'ico-check',
    color: 'yellow',
    theme: 'dark',
    backgroundColor: 'rgba(248, 199, 85, 0.9)',
    message: 'Saved successfully.',
    messageSize: '17',
    messageLineHeight: '30',
    messageColor: 'white',
    layout: 2,
    maxWidth: '500px',
    transitionIn: 'bounceInUp',
    transitionOut: 'flipOutX',
    progressBarColor: '#cead60',
  };

  constructor(private alertsActions: AlertsActions) {
    this.notifications.subscribe(notificationStream => {

      this.listNotifications = [];
      this.listStickyNotification = [];
      let notification: Notification;
      for (let i = 0, l = notificationStream.length; i < l; i++) {
        notification = notificationStream[i];
        if (notification.type === NOTIFICATION_TYPE.ERROR) {
          notification.message = this.parseErrorMessage(notification.message);
        }
        notification.message = this.parseMessage(notification.message);

        if (notification.mode === NOTIFICATION_MODE.DEFAULT) {
          if (notification.type === NOTIFICATION_TYPE.ERROR) {
            this.listStickyNotification.push(notification);
          } else {
            /*this.listNotifications.push({
              severity: notification.type.toLowerCase(),
              summary: notification.type + ' MESSAGE',
              detail: notification.message
            });*/
            this.showMessage(notification.message, notification.type);
          }
        } else if (notification.mode === NOTIFICATION_MODE.STICKY) {
          this.listStickyNotification.push(notification);
        } else {
          this.listNotifications.push({
            severity: notification.type.toLowerCase(),
            summary: notification.type + ' MESSAGE',
            detail: notification.message
          });
        }
      }
    });
  }

  showMessage(message: string, type: string) {
    let msgConfig = null;
    if (type === NOTIFICATION_TYPE.INFO) {
      msgConfig = {
        ...this.defaultConfig,
        icon: 'ico-info',
        color: 'blue',
        backgroundColor: 'rgba(63, 186, 228, 0.9)',
        progressBarColor: '#328cab',
        message: message,
      };
    } else if (type === NOTIFICATION_TYPE.WARNING) {
      msgConfig = {
        ...this.defaultConfig,
        icon: 'ico-warning',
        color: 'yellow',
        backgroundColor: 'rgba(248, 199, 85, 0.9)',
        progressBarColor: '#cead60',
        message: message,
      };
    } else if (type === NOTIFICATION_TYPE.ERROR) {
      msgConfig = {
        ...this.defaultConfig,
        icon: 'ico-error',
        color: 'red',
        backgroundColor: 'rgba(182, 70, 69, 0.9)',
        progressBarColor: '#813838',
        message: message,
      };
    } else {
      msgConfig = {
        ...this.defaultConfig,
        icon: 'ico-check',
        color: 'green',
        backgroundColor: 'rgba(132, 212, 93, 0.9)',
        progressBarColor: '#6fb04f',
        message: message,
      };
    }

    iziToast.show(msgConfig);
  }

  /**
   * Parse the error message return by server, get the message part inside content part.
   *
   */
  parseErrorMessage(message: string) {
    let arrMsg: string[] = message.split('content:');

    if (arrMsg.length < 2) {
      return message;
    }

    let errorMsg: string = arrMsg[1],
        errorObj: any = JSON.parse(errorMsg);

    return errorObj.message;
  }

  /**
   * Parse the message and wrap span tag and icon around the message if there're several messages
   *
   */
  parseMessage(message: string) {
    let arrMessage: string[] = message.slice().replace(/\n$/, '').split('\n'),
        parsedMessage: string = '',
        arrParsedMessage: string[] = [],
        iconTag: string = '<i class="fa fa-caret-right" aria-hidden="true"></i>';

    if (arrMessage.length < 2) {
      iconTag = '';
    }
    arrParsedMessage = arrMessage.map(msg => {
      return `<span>${iconTag} ${msg}</span>`;
    });

    parsedMessage = arrParsedMessage.join('');

    return parsedMessage;
  }

  /**
   * Event handler to hide the divEle (contains the sticky message) on click
   *
   */
  onHideNotificationHandler(divEle: any) {
    let curNotificationID = divEle.getAttribute('data-id');
    this.alertsActions.hide(curNotificationID);
  }
}
