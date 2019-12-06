import { Injectable } from '@angular/core';
import { ToolType, ITool, IChangeTool } from '../common/tools/tool';
import { SelectTool } from '../common/tools/select-tool';
import { Vector2 } from '../common/vector2';
import { DrawPixi } from '../drawing/draw-pixi';
import { CameraService } from './camera-service';
import { BuildTool } from '../common/tools/build-tool';
import { BlueprintItem } from '../common/blueprint/blueprint-item';
import { ElementReportTool } from '../common/tools/element-report-tool';

@Injectable({ providedIn: 'root' })
export class ToolService implements ITool, IChangeTool
{
  public currentToolType: ToolType;
  private get currentTool(): ITool { 
    if (this.currentToolType == ToolType.select) return this.selectTool;
    else if (this.currentToolType == ToolType.build) return this.buildTool;
    else if (this.currentToolType == ToolType.elementReport) return this.elementReportTool;
    else return null;
  }
  private observers: IObsToolChanged[];

  constructor(
    public selectTool: SelectTool, 
    public buildTool: BuildTool,
    public elementReportTool: ElementReportTool)
  {
    this.currentToolType = ToolType.select;
    this.observers = [];

    this.buildTool.parent = this;
    this.elementReportTool.parent = this;
  }

  subscribeToolChanged(observer: IObsToolChanged)
  {
    this.observers.push(observer);
  }

  changeTool(newTool: ToolType)
  {
    if (newTool == ToolType.select || newTool == ToolType.build) {
      this.currentTool.switchFrom();
      this.currentToolType = newTool;
      this.currentTool.switchTo();
    }
    else if (newTool == ToolType.elementReport) {
      this.elementReportTool.toggle();
    }
    

    this.observers.map((observer) => observer.toolChanged(newTool) );
  }

  // Tool interface
  switchFrom() {}

  switchTo() {}

  mouseOut() {
    this.currentTool.mouseOut();
  }

  mouseDown(tile: Vector2) {
    this.currentTool.mouseDown(tile);
  }

  leftClick(tile: Vector2) {
    this.currentTool.leftClick(tile);
  }
  rightClick(tile: Vector2) {
    this.currentTool.rightClick(tile);
  }
  hover(tile: Vector2) {
    this.currentTool.hover(tile);
  }
  drag(tileStart: Vector2, tileStop: Vector2) {
    this.currentTool.drag(tileStart, tileStop);
  }
  dragStop() {
    this.currentTool.dragStop();
  }
  keyDown(keyCode: string) {
    this.currentTool.keyDown(keyCode);
  }
  draw(drawPixi: DrawPixi, camera: CameraService) {
    this.currentTool.draw(drawPixi, camera);
  }
}

export class ToolRequest
{
  toolType: ToolType;
  templateItem: BlueprintItem;
}

export interface IObsToolChanged
{
  toolChanged(toolType: ToolType);
}