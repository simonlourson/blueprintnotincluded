import { Vector2 } from "../vector2";
import { Blueprint } from "./blueprint";
import { BlueprintItem } from "./blueprint-item";
import { DrawHelpers } from '../../drawing/draw-helpers';
import { DrawPart } from '../../drawing/draw-part';
import { CameraService } from '../../services/camera-service';

export class BlueprintItemElement extends BlueprintItem
{

  constructor(id: string)
  {
    super(id);
  }

  public prepareSpriteVisibility(camera: CameraService) {
  }

  public updateTileables(blueprint: Blueprint) {
  }

  drawTemplateItem(templateItem: BlueprintItem, camera: CameraService) {
  }

}