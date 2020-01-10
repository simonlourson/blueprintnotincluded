import { Vector2 } from "../vector2";
import { Blueprint } from "./blueprint";
import { BlueprintItem } from "./blueprint-item";
import { DrawHelpers } from '../../drawing/draw-helpers';
import { DrawPart } from '../../drawing/draw-part';
import { CameraService } from '../../services/camera-service';
import { Visualization, Overlay, Display } from '../overlay-type';
import { SpriteTag } from '../../drawing/sprite-modifier';

export class BlueprintItemElement extends BlueprintItem
{

  get header() { return this.buildableElements[0].name; }

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

    this.isOpaque = (camera.overlay == Overlay.Gas || camera.overlay == Overlay.Base);

    // TODO use enum
    if (camera.overlay == Overlay.Gas)
      this.depth = 17 + 100;
    else this.depth = 17;

    this.alpha = 1;

    for (let drawPart of this.drawParts) {

      drawPart.visible = false;

      // TODO boolean in export
      if (this.buildableElements[0].hasTag('Gas') && camera.display == Display.solid && (camera.overlay == Overlay.Base || camera.overlay == Overlay.Gas)) {
        if (drawPart.hasTag(SpriteTag.element_gas_back)) {
          drawPart.visible = true;
          drawPart.zIndex = 0;
          drawPart.alpha = 0.5;

          if (camera.visualization == Visualization.temperature)
            drawPart.tint = DrawHelpers.temperatureToColor(this.temperature);
          else
            drawPart.tint = this.buildableElements[0].uiColor;
        }
        else if (drawPart.hasTag(SpriteTag.element_gas_front)) {
          drawPart.visible = true;
          drawPart.zIndex = 1;
          drawPart.alpha = 0.8;
          drawPart.tint = 0xffffff;
        }
      }
      else if (this.buildableElements[0].hasTag('Liquid') && camera.display == Display.solid && (camera.overlay == Overlay.Base || camera.overlay == Overlay.Liquid)) {
        if (drawPart.hasTag(SpriteTag.element_gas_back)) {
          drawPart.visible = true;
          drawPart.zIndex = 0;
          drawPart.alpha = 0.5;

          if (camera.visualization == Visualization.temperature)
            drawPart.tint = DrawHelpers.temperatureToColor(this.temperature);
          else
            drawPart.tint = this.buildableElements[0].uiColor;
        }
        else if (drawPart.hasTag(SpriteTag.element_liquid_front)) {
          drawPart.visible = true;
          drawPart.zIndex = 1;
          drawPart.alpha = 0.8;
          drawPart.tint = 0xffffff;
        }
      }
    }
  }
  

}