import { ITool, IChangeTool, ToolType } from './tool';
import { Vector2 } from '../vector2';
import { DrawPixi } from '../../drawing/draw-pixi';
import { CameraService } from '../../services/camera-service';
import { BlueprintService } from '../../services/blueprint-service';
import { Injectable } from '@angular/core';
import { BuildableElement } from '../bexport/b-element';

@Injectable()
export class ElementReportTool implements ITool {

  visible: boolean = false;

  parent: IChangeTool;
  data: ElementReportDataItem[];

  constructor(private blueprintService: BlueprintService) {
    this.data = [];
  }

  updateElementReport() {
    this.data = [];

    this.blueprintService.blueprint.blueprintItems.map((item) => {
      for (let elementIndex = 0; elementIndex < item.oniItem.buildableElementsArray.length; elementIndex++) {
        this.addElementToReport(item.buildableElements[elementIndex], item.oniItem.materialMass[elementIndex])
      }
    });
  }

  toggle() {
    this.visible = !this.visible;

    if (this.visible) this.updateElementReport();
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


}

export interface ElementReportDataItem {
  buildableElement: BuildableElement;
  totalMass: number;
}