import { Vector2 } from "../vector2";
import { Camera } from "../camera";
import { Template } from "../template/template";
import { TemplateItem } from "../template/template-item";
import { DrawAbstraction } from '../../drawing/draw-abstraction';

export interface Tool
{
  toolType: ToolType;
  setTemplateItem(templateItem: TemplateItem);

  leftMouseDown(blueprint: Template, tile: Vector2);
  leftMouseUp(blueprint: Template, tile: Vector2);

  leftClick(blueprint: Template, tile: Vector2);
  rightClick(blueprint: Template, tile: Vector2);

  changeTile(blueprint: Template, previousTile: Vector2, currentTile: Vector2);
  changeTileDrag(blueprint: Template, previousTileDrag: Vector2, currentTileDrag: Vector2);

  prepareSpriteInfoModifier(blueprint: Template);
  draw(drawAbstraction: DrawAbstraction, camera: Camera);

  destroyTool();
}

export enum ToolType
{
    select,
    build
}