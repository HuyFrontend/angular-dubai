import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Notification } from 'state';

@Component({
    selector: 'mbc-confirmation',
    templateUrl: 'mbc-confirmation.html',
    styleUrls:['mbc-confirmation.scss']
})

export class MBCConfirmationComponent implements OnInit {
    @Input('title') title: string = 'Confirmation';
    @Input('type') type: string = 'YesNo';
    @Input('message') message: any;
    @Input('displayComment') displayComment: boolean;
    @Input('data') data: any;
    @Input('yesTitle') yesTitle: string = 'Yes';
    @Input('noTitle') noTitle: string = 'No';
    @Input('cancelTitle') cancelTitle: string = 'Cancel';
    @Input('okTitle') okTitle: string = 'Ok';
    @Input('width') width: string = '';
    @Input('height') height: string = '';
    @Input('customClass') customClass: string = '';

    @Output() okAction = new EventEmitter<any>();
    @Output() yesAction = new EventEmitter<any>();
    @Output() noAction = new EventEmitter<any>();
    @Output() cancelAction = new EventEmitter<any>();


    @ViewChild('confirmationModal') public confirmationModal:ModalDirective;

    private comment:string;

    constructor() { }

    ngOnInit() { }

    isDisplayYesBtn(){;
      if(!this.displayComment){
        return true;
      }
      if(!this.comment || this.comment.trim()==''){
        return false;
      }
      return true;
    }

    onYes() {
      if(!this.isDisplayYesBtn()){
        return ;
      }
      if(this.displayComment){
        if(!this.data){
          this.data = {};
        }
        this.data.comment = this.comment;
      }
      this.yesAction.emit(this.data);
      this.confirmationModal.hide();
    }

    onNo() {
      this.noAction.emit(this.data);
      this.confirmationModal.hide();
    }

    onOK() {
      this.okAction.emit(this.data);
      this.confirmationModal.hide();
    }

    onCancel() {
      this.cancelAction.emit(this.data);
      this.confirmationModal.hide();
    }

    show(callbackData = undefined) {
      this.data = callbackData;
      this.comment = '';
      this.confirmationModal.show();
    }
}
