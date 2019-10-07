import { Directive, Output, HostListener, EventEmitter } from '@angular/core';

@Directive({ selector: '[keyEvents]' })
export class KeyboardDirective {
  @Output() keyPress = new EventEmitter();

  @HostListener('keyup', ['$event']) onKeyPress(event: any) {
    console.log('truc');
    this.keyPress.emit(event);
  }

}