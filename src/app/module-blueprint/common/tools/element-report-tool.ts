import { ITool, IChangeTool, ToolType } from './tool';
import { Vector2 } from '../vector2';
import { DrawPixi } from '../../drawing/draw-pixi';
import { CameraService } from '../../services/camera-service';
import { BlueprintService } from '../../services/blueprint-service';
import { Injectable } from '@angular/core';
import { BuildableElement } from '../bexport/b-element';
import { IObsBlueprintChange } from '../blueprint/blueprint';
import { BlueprintItem } from '../blueprint/blueprint-item';

@Injectable()
export class ElementReportTool implements ITool, IObsBlueprintChange {

  parent: IChangeTool;
  data: ElementReportDataItem[];

  constructor(private blueprintService: BlueprintService) {
    this.data = [];

    this.blueprintService.blueprint.subscribeBlueprintChanged(this)
  }

  updateElementReport() {
    this.data = [];

    this.blueprintService.blueprint.blueprintItems.map((item) => {
      for (let elementIndex = 0; elementIndex < item.oniItem.buildableElementsArray.length; elementIndex++) {
        this.addElementToReport(item.buildableElements[elementIndex], item.oniItem.materialMass[elementIndex])
      }
    });

    this.data = this.data.sort((i1, i2) => { return i2.totalMass - i1.totalMass; });
  }

  private addElementToReport(buildableElement: BuildableElement, mass: number) {
    let alreadyPresent = false;
    this.data.map((dataItem) => {
      if (dataItem.buildableElement == buildableElement) {
        alreadyPresent = true;
        dataItem.totalMass += mass;
      }
    });

    if (!alreadyPresent) {
      this.data.push({
        buildableElement: buildableElement,
        totalMass: mass
      });
    }
  }

  // Blueprint Change interface
  itemDestroyed() {}
  itemAdded(blueprintItem: BlueprintItem) {}
  blueprintChanged() {
    this.updateElementReport();
  }

  // Tool interface
  switchFrom() {
  }  
  switchTo() {
    this.updateElementReport();
  }
  leftClick(tile: Vector2) {
  }
  rightClick(tile: Vector2) {
    this.parent.changeTool(ToolType.select);
  }
  mouseDown(tile: Vector2) {
  }
  mouseOut() {
  }
  hover(tile: Vector2) {
  }
  drag(tileStart: Vector2, tileStop: Vector2) {
  }
  dragStop() {
  }
  keyDown(keyCode: string) {
  }
  draw(drawPixi: DrawPixi, camera: CameraService) {
  }

  toggleable: boolean = true;
  visible: boolean = false;
  captureInput: boolean = false;
  toolType = ToolType.elementReport;
  toolGroup: number = 2;
}

export interface ElementReportDataItem {
  buildableElement: BuildableElement;
  totalMass: number;
}