export class CommentModel {
  constructor(obj?: any) {
    this.comment = obj && obj.comment || '';
    this.tooltipContent = obj && obj.tooltipContent || '';
  }
      comment: string;
      rejectedDate: Date;
      tooltipContent: string;
}
