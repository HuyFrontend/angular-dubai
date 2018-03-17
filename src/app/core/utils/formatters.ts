import * as moment from 'moment';
import * as format from 'string-format';
import { getDateFormat} from './date-helpers';

export const dateFormatter = (value, entry) => {
    if(!value) return '';
    return moment(value).format('DD/MM/YYYY HH:mm');
}

export const campaignStatusFormatter = (value, entry) => {
    let formattedStatus = 'Draft';
    if(!value) return formattedStatus;
    const campaign = entry;
    formattedStatus = campaign.status.toString();
    switch(campaign.status) {
        case 'pendingLive':
            formattedStatus = 'Pending Live';
            break;
        case 'partialLive':
            formattedStatus = 'Partial Live';
            break;
        case 'inactive':
            formattedStatus = 'Unpublished';
            break;
    }
    return formattedStatus;
}

export const rejectNoteTooltip = (comment: string, dateTime: Date) => {
  return format(`<div class="tooltipComment">
                  <span>{}</span>
                  <p style="text-align:center;">--------------------------------------</p>
                  <p class="main-content">{}<p>
                </div>`,
                getDateFormat(dateTime),
                comment);
}

