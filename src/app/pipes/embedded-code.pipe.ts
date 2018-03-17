import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'embeddedCode' })
export class EmbeddedCodePipe implements PipeTransform {
	transform(input:string):string {
    return `stringHTML_Here/${input}`;
  }
}