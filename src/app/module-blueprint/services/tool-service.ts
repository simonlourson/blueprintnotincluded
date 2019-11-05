import { Injectable } from '@angular/core';
import { ToolType } from '../common/tools/tool';
import { SelectTool } from '../common/tools/select-tool';
import { Vector2 } from '../common/vector2';

@Injectable({ providedIn: 'root' })
export class ToolService
{
  public currentTool: ToolType;

  constructor(public selectTool: SelectTool)
  {
  }

  leftClick(tile: Vector2)
  {
    this.selectTool.leftClick(tile);
  }
}