import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { OniItem } from 'src/app/module-blueprint/common/oni-item';
import { SelectItem } from 'primeng/api';
import { BuildableElement } from 'src/app/module-blueprint/common/bexport/b-element';
import { OverlayPanel } from 'primeng/overlaypanel';
import { CameraService } from 'src/app/module-blueprint/services/camera-service';
import { Visualization } from 'src/app/module-blueprint/common/overlay-type';

@Component({
  selector: 'app-buildable-element-picker',
  templateUrl: './buildable-element-picker.component.html',
  styleUrls: ['./buildable-element-picker.component.css']
})
export class BuildableElementPickerComponent implements OnInit {

  @Input() buildableElementsArray: BuildableElement[][];
  @Input() currentElement: BuildableElement[];
  @Input() nbElements: number[];

  @Output() changeElement: EventEmitter<ElementChangeInfo> = new EventEmitter<ElementChangeInfo>();

  @ViewChildren(OverlayPanel) elementPanels !: QueryList<OverlayPanel>;

 
  constructor(private cameraService: CameraService) { }

  ngOnInit() {
  }

  showWarning(indexElement: number) { 
    return this.nbElements != null && this.nbElements[indexElement] > 1;
  } 


  showElements(event: any, indexElement: number) {
    let currentIndexElement = 0;
    this.elementPanels.forEach((elementPanel) => {
      if (indexElement == currentIndexElement) elementPanel.toggle(event);
      else elementPanel.hide();

      currentIndexElement++;
    });
  }

  chooseElement(buildableElement: BuildableElement, index: number) {
    this.changeElement.emit({newElement: buildableElement, index:index});
    this.elementPanels.forEach((elementPanel) => { elementPanel.hide(); });

    this.currentElement[index] = buildableElement;
  }

  elementsVisualization() {
    this.cameraService.visualization = Visualization.elements;
  }
}

export interface ElementChangeInfo {
  newElement: BuildableElement;
  index: number;
}