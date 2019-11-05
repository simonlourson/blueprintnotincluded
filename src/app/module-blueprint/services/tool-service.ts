import { Injectable } from '@angular/core';
import { ToolType } from '../common/tools/tool';
import { SelectTool } from '../common/tools/select-tool';
import { Vector2 } from '../common/vector2';
import { DrawPixi } from '../drawing/draw-pixi';
import { Camera } from '../common/camera';
import { BuildTool } from '../common/tools/build-tool';

@Injectable({ providedIn: 'root' })
export class ToolService
{
  public currentTool: ToolType;

  constructor(public selectTool: SelectTool, public buildTool: BuildTool)
  {
    this.currentTool = ToolType.select;
  }

  leftClick(tile: Vector2)
  {
    this.selectTool.leftClick(tile);
  }

  changeTool(newTool: ToolType)
  {
    if (this.currentTool == ToolType.build) this.buildTool.destroy();

    this.currentTool = newTool;
  }

  draw(drawPixi: DrawPixi, camera: Camera)
  {
  }
}