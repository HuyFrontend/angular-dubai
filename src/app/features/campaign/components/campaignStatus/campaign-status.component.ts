import { Component, OnInit, Input } from '@angular/core';
import { select } from '@angular-redux/store';
import { Campaign } from 'models';
import { CAMPAIGN_STATUS} from 'constant';

import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'campaign-status',
  template: '<span class="{{getStatusClass()}}">{{getCampaignStatus()}}</span>',
})

export class CampaignStatusComponent implements OnInit {
	@select(['forms', 'campaign']) campaign$: Observable<Campaign>;

	private campaign: Campaign;

	constructor() { }

	ngOnInit() {
		this.campaign$.subscribe(c => {
            this.campaign = c;
        });
	}


	getCampaignStatus(): string {
		let formattedStatus = this.campaign.status ? this.campaign.status.toString(): '';
		switch(this.campaign.status) {
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

	getStatusClass(): string {
		let status = this.campaign.status;
		if (!status) return '';

		let classStr = 'text-capitalize ';
		if (status === 'live' || status === 'pendingLive' || status === 'partialLive') {
			classStr += 'text-success';
		} else if (status === 'draft') {
			classStr += 'text-warning';
		} else if (status === 'inactive') {
			classStr += 'text-danger';
		}
		return classStr;
	}
}
