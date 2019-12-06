import { Vector2 } from '../vector2';
import { DrawPixi } from '../../drawing/draw-pixi';
import { CameraService } from '../../services/camera-service';

export enum ToolType
{
    select,
    build,
    elementReport
}

export interface ITool
{
  switchFrom();
  switchTo();

  // Interaction
  leftClick(tile: Vector2);
  rightClick(tile: Vector2);
  mouseDown(tile: Vector2);
  mouseOut();
  hover(tile: Vector2);
  drag(tileStart: Vector2, tileStop: Vector2);
  dragStop();
  keyDown(keyCode: string);
  draw(drawPixi: DrawPixi, camera: CameraService);
}

export interface IChangeTool
{
  changeTool(toolType: ToolType);
}