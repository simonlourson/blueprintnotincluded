import { Vector2 } from "../common/vector2";
import { Camera } from "../common/camera";
import { SpriteInfo } from "./sprite-info";
import { SpriteModifier } from "../common/sprite-modifier";
import { ImageSource } from "./image-source";
import { SpriteModifierPart } from "../common/sprite-modifier-part";

export class DrawHelpers
{
  public static whiteColor = '#ffffff';

  public static createUrl(ressource: string, ui: boolean): string
  {
    return 'assets/images/'+(ui?'ui/':'')+ressource+'.png';
  }

  public static rotateVector2(v: Vector2, center: Vector2, rotation: number): Vector2
  {
    if (rotation == 0) return v;

    let rotationRadian = -rotation*Math.PI/180;
    let vOrigin = new Vector2(v.x - center.x, v.y - center.y);
    let returnValue = new Vector2(
      Math.cos(rotationRadian) * vOrigin.x - Math.sin(rotationRadian) * vOrigin.y,
      Math.sin(rotationRadian) * vOrigin.x + Math.cos(rotationRadian) * vOrigin.y
    );
    returnValue.x += center.x;
    returnValue.y += center.y;
    
    return returnValue;
  }

  public static scaleVector2(v: Vector2, center: Vector2, scale: Vector2): Vector2
  {
    if (Vector2.One.equals(scale)) return v;

    let returnValue = new Vector2(v.x, v.y);
    if (scale.x == -1) returnValue.x = 2 * center.x - v.x;
    if (scale.y == -1) returnValue.y = 2 * center.y - v.y;

    return returnValue
  }

  public static getRandomColor()
  {
    return 'rgba(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',1)';
  }

  public static drawFullRectangle(ctx: CanvasRenderingContext2D, camera: Camera, topLeft: Vector2, bottomRight: Vector2, color: string)
  {
    let rectanglePosition = new Vector2(
      (topLeft.x + camera.cameraOffset.x + 1) * camera.currentZoom,
      (-topLeft.y + camera.cameraOffset.y + 1) * camera.currentZoom
    );
    let rectangleSize = new Vector2(
      (bottomRight.x - topLeft.x + 1) * camera.currentZoom - 2*camera.currentZoom,
      (topLeft.y - bottomRight.y + 1) * camera.currentZoom - 2*camera.currentZoom
    );

    // Draw the debug rectangle
    ctx.fillStyle = color;
     ctx.fillRect(rectanglePosition.x, rectanglePosition.y, rectangleSize.x, rectangleSize.y);
  }

  public static hexToRgb(hex: string): number[]
  {
    return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
      ,(m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1).match(/.{2}/g)
      .map(x => parseInt(x, 16));
  }    
}