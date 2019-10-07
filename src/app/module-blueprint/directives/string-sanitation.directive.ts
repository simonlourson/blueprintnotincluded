import { Directive } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';


@Directive({
  selector: '[appStringSanitation]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: StringSanitationDirective, multi: true }
  ]
})
export class StringSanitationDirective implements Validator {

  constructor() { }

  regexp = /^[a-zA-Z0-9-_]+$/;
  validate(control: AbstractControl): { [key: string]: any } {

    if (control.value == null) return null;
    if (control.value.length == 0) return null;
    if (control.value.search(this.regexp) != -1) return null;
    return { invalidChars: true }
    
    
  }
}
