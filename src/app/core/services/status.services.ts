import { Injectable } from '@angular/core';

/**
 *
 * Handle formatting/mapping status text from server -> client before displaying
 *
 * @export
 * @class StatusService
 */
@Injectable()
export class StatusService {
  constructor() { }

  getFormattedStatus(status: string): string {
    if(!status){
      return '';
    }
    let formatStt = status.slice(0);

    switch (formatStt.toLowerCase()) {
      case 'pending':
        formatStt = 'Pending Approval';
        break;

      case 'checkingNeedModerate':
      case 'ready':
        formatStt = 'Processing';
        break;

      case 'modified':
        formatStt = 'Updated';
        break;
      case 'inactive':
        formatStt = 'Unpublished';
        break;
    }

    return formatStt;
  }
}
