import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms'
import { SOCIAL_NETWORKS } from 'constant';

@Component({
    selector: 'social-network',
    styleUrls: ['social-network.scss'],
    templateUrl: 'social-network.html'
})

export class SocialNetworkComponent implements OnInit {

    @Input() socialNetworks: FormControl;

    public listSocialNetwork: any[] = [];
    public socialNetworkSugestions: any[];
    public socialNetwork: any;

    constructor() {
        this.socialNetworkSugestions = SOCIAL_NETWORKS;
        this.socialNetwork = {
            name: '',
            accountId: ''
        }
    }

    ngOnInit() {
    }

    onAdd() {
        this.validateSocialUrl(this.socialNetwork.name, this.socialNetwork.accountId);
        if(this.socialNetworks.invalid) {
            return ;
        }
        this.listSocialNetwork.push({
            accountId: this.socialNetwork.accountId,
            socialNetworkName: this.socialNetwork.name
        });
        this.socialNetwork = {
            name: '',
            accountId: ''
        }
        this.socialNetworks.setValue(this.listSocialNetwork);
    }

    ngOnChanges(changes: SimpleChanges) {
      if (this.socialNetworks.value) {
        this.listSocialNetwork = this.socialNetworks.value;
        if (this.listSocialNetwork.length === 0) {
          this.socialNetwork.accountId = '';
        }
      } else {
        this.listSocialNetwork = [];
        this.socialNetwork.accountId = '';
      }
    }

    onRemove(idx) {
        this.listSocialNetwork = [
            ...this.listSocialNetwork.slice(0, idx),
            ...this.listSocialNetwork.slice(idx + 1, this.listSocialNetwork.length)
        ];
        this.socialNetworks.setValue(this.listSocialNetwork);
    }

    validateSocialUrl(socialName:string, socialUrl:string){
        this.socialNetworks.setErrors(null);
        if(!socialUrl){
            this.socialNetworks.setErrors({'required': true});
            return ;
        }
        if(!socialName){
            this.socialNetworks.setErrors({'requiredSocialType': true});
            return ;
        }
        const filteredList = this.socialNetworkSugestions.filter(x=>
            x.name === socialName && socialUrl.indexOf(x.url + '/') >= 0);

        const valid = filteredList && filteredList.length > 0;

        if(!valid){
            this.socialNetworks.setErrors({'invalid': true});
        }
    }
    displaySocialName(socialName: string){
        let socialItem = this.socialNetworkSugestions.filter(x=>x.name == socialName);
        if(socialItem != null && socialItem.length > 0){
            return socialItem[0].displayName;
        }
        return socialName;
    }
    onTextChange(){
        this.socialNetworks.setErrors(null);
    }
}
