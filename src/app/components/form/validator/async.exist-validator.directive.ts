import { ContentService, CampaignService, AppService } from 'services';
import { Directive, forwardRef, Renderer2, ElementRef, Input } from "@angular/core";
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl } from "@angular/forms";
import { Observable } from "rxjs/Rx";

@Directive({
  selector: "[asyncExistValidator][formControlName], [asyncExistValidator][ngModel]",
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => AsyncExistValidator), multi: true
    }
  ]
})

export class AsyncExistValidator implements Validator {

  @Input() public originalValue: string = '';
  @Input() public entityType: string = '';

  constructor(
    private campaignService: CampaignService,
    private appService: AppService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) { }

  validate(c: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> {
    return Observable.timer(500).switchMap(() => {
      const origVal = this.originalValue ? this.originalValue.trim() : '';
      const newVal = c.value ? c.value.trim() : '';

      if (newVal && newVal !== origVal) {
        if (this.entityType === "app")
          return this.appService.checkAppExist("data.title", newVal).map(res => {
            return this.handleResultAfterCheckingItExistence(res);
          });
        else
          return this.campaignService.checkUniqueCampaignName(newVal).map(res => {
            return this.handleResultAfterCheckingItExistence(res);
          });
      } else {
        return new Observable(obs => {
          return null;
        });
      }
    });
  }

  private handleResultAfterCheckingItExistence (res : any) {
    if (res.result) {
      return { asyncInvalid: 'This value already exists. Please choose another value.' };
    } else {
      return null;
    }
  }
}
