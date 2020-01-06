import { Vector2 } from "../vector2";
import { Blueprint } from "./blueprint";
import { BlueprintItem } from "./blueprint-item";
import { DrawHelpers } from '../../drawing/draw-helpers';
import { DrawPart } from '../../drawing/draw-part';
import { CameraService } from '../../services/camera-service';
import { Visualization } from '../overlay-type';

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

  
  cameraChanged(camera: CameraService) {

    //super.cameraChanged(camera);

    this.depth = 17;
    this.alpha = 1;

    for (let drawPart of this.drawParts) {
      drawPart.visible = true;
      drawPart.zIndex = 0;
      drawPart.tint = this.buildableElements[0].uiColor;
      drawPart.alpha = 0.5;

      if (camera.visualization == Visualization.temperature) {
        drawPart.tint = DrawHelpers.temperatureToColor(this.temperature);
        /*
        if (drawPart.hasTag(SpriteTag.white)) {
          drawPart.visible = true;
          drawPart.zIndex = 1;
          this.visualizationTint = DrawHelpers.temperatureToColor(this.temperature);
          drawPart.alpha = 0.7;
        }
        */
      }
    }
  }
  

}