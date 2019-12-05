import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { OniItem } from 'src/app/module-blueprint/common/oni-item';
import { SelectItem } from 'primeng/api';
import { BuildableElement } from 'src/app/module-blueprint/common/bexport/b-element';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-buildable-element-picker',
  templateUrl: './buildable-element-picker.component.html',
  styleUrls: ['./buildable-element-picker.component.css']
})
export class BuildableElementPickerComponent implements OnInit {

  @Input() buildableElements: BuildableElement[];
  @Input() currentElement: BuildableElement;

  @Output() changeElement: EventEmitter<BuildableElement> = new EventEmitter<BuildableElement>();

  @ViewChild('elementPanel', {static: true}) elementPanel: OverlayPanel;

  constructor() { }

  ngOnInit() {
  }

  showElements(event: any) {
    this.elementPanel.toggle(event);
  }

  chooseElement(buildableElement: BuildableElement) {
    this.changeElement.emit(buildableElement);
    this.elementPanel.hide();
  }
}
