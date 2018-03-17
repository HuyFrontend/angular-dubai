import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderBy' })
export class OrderrByPipe implements PipeTransform {
	transform(records: Array<any>, args?: any): any {
		// console.log('records', records);
		// console.log('args.property', args.property);
		// console.log('args.direction', args.direction);
		return records.sort(function (a = '', b = '') {
			// console.log(`sort: ${typeof(a[args.property])} vs ${typeof(b[args.property])}`);
			if (!a[args.property]) {
				return 1 * args.direction;
			}
			else if (!b[args.property]) {
				return -1 * args.direction;
			}
			else if (a[args.property] < b[args.property]) {
				return -1 * args.direction;
			} else if (a[args.property] > b[args.property]) {
				return 1 * args.direction;
			} else {
				return 0;
			}

		});

	};
}