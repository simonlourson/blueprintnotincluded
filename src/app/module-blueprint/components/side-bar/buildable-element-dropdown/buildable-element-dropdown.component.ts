import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { OniItem } from 'src/app/module-blueprint/common/oni-item';
import { SelectItem } from 'primeng/api';
import { BuildableElement } from 'src/app/module-blueprint/common/bexport/b-element';

@Component({
  selector: 'app-buildable-element-dropdown',
  templateUrl: './buildable-element-dropdown.component.html',
  styleUrls: ['./buildable-element-dropdown.component.css']
})
export class BuildableElementDropdownComponent implements OnInit {

  @ViewChild('focusTarget', {static: true}) focusTarget: ElementRef

  private oniItem_: OniItem;
  get oniItem(): OniItem { return this.oniItem_; }

  @Input() 
  set oniItem(value: OniItem) {
    console.log('set oniItem')
    console.log(value)
    if (this.oniItem_ != value) {
      console.log('set different')
      this.oniItem_ = value;

      this.elements = [];
      for (let element of this.oniItem.buildableElements) 
        this.elements.push({label:element.name, value:element});
        
      if (this.oniItem.buildableElements.length > 0) this.currentElement = this.oniItem.buildableElements[2]
        console.log(this.elements)
    }
  }

  elements: SelectItem[];
  currentElement: BuildableElement;

  constructor() { }

  ngOnInit() {
    this.elements = [];
  }

  changeElement() {
    console.log('changeElement');
  }

  onFocus() {
    //this.focusTarget.nativeElement.focus();
  }
}
