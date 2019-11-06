import { Vector2 } from '../vector2';
import { DrawPixi } from '../../drawing/draw-pixi';
import { Camera } from '../camera';

export enum ToolType
{
    select,
    build
}

export interface ITool
{
  switchFrom();
  switchTo();

  // Interaction
  leftClick(tile: Vector2);
  rightClick(tile: Vector2);
  hover(tile: Vector2);
  drag(tileStart: Vector2, tileStop: Vector2);
  dragStop();
  draw(drawPixi: DrawPixi, camera: Camera);
}

export interface IChangeTool
{
  changeTool(toolType: ToolType);
}