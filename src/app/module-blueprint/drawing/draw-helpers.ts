import { Vector2 } from "../common/vector2";
import { Camera } from "../common/camera";
import { SpriteInfo } from "../common/sprite-info";
import { SpriteModifier } from "../common/sprite-modifier";
import { ImageSource } from "../common/image-source";
import { SpriteModifierPart } from "../common/sprite-modifier-part";

export class DrawHelpers
{
  public static whiteColor = '#ffffff';

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

  public static drawTileComplex(ctx: CanvasRenderingContext2D, camera: Camera, spriteInfo: SpriteInfo, spriteModifier: SpriteModifier, imageId: string,
      position: Vector2, tileOffset: Vector2, realSize: Vector2, scale: Vector2, rotation: number, alpha: number, color: string)
  {
    // TODO fixme last part here
    let lastPart: SpriteModifierPart = spriteModifier.getLastPart();
    let image = ImageSource.getImage(imageId);
    if (image == null || image.width == null ||image.width == 0) return;

    ctx.save();

    let positionCorrected = new Vector2(
      (position.x + tileOffset.x + camera.cameraOffset.x) * camera.currentZoom,
      (-position.y + tileOffset.y + camera.cameraOffset.y - realSize.y + 1) * camera.currentZoom
    );
        
    let sizeCorrected = new Vector2(
      realSize.x * camera.currentZoom * spriteInfo.sourceSize.x / spriteInfo.realSize.x,
      realSize.y * camera.currentZoom * spriteInfo.sourceSize.y / spriteInfo.realSize.y
    );
        
    let halfRealSize = new Vector2(
      (realSize.x - (realSize.x + 1) % 2) * camera.currentZoom * 0.5,
      (realSize.y - 0.5) * camera.currentZoom
    );

    
    let drawOffsetTransform = new Vector2(
      spriteModifier.getLastPart().transform.m02,
      spriteModifier.getLastPart().transform.m12
    );


    // Etape 1 : On place l'image en haut à gauche du canvas
    ctx.translate(positionCorrected.x, positionCorrected.y);

    // Etape 2 : On centre l'image sur le coin en haut à gauche du canvas
    //ctx.translate(halfRealSize.x, halfRealSize.y);

    // Etape 3.1 : On effectue les operation miroir
    //if (spriteModifier != null) ctx.scale(spriteModifier.scale.x * scale.x, spriteModifier.scale.y * scale.y)
    //if (spriteModifier != null) ctx.scale(lastPart.transform.m00 * scale.x, lastPart.transform.m11 * scale.y);

    // Etape 3.2 : On effectue la rotation
    //if (spriteModifier != null) ctx.rotate((lastPart.rotation + rotation)*Math.PI/180);
        


    /*
    ctx.transform(
      spriteModifier.getLastPart().transform.m00,
      spriteModifier.getLastPart().transform.m10,
      spriteModifier.getLastPart().transform.m01,
      spriteModifier.getLastPart().transform.m11,
      0,
      0);

    */

   ctx.translate(
    ((0.5 - spriteInfo.pivot.x) * spriteInfo.sourceSize.x) * camera.currentZoom * realSize.x / spriteInfo.realSize.x,
    ((0.5 - spriteInfo.pivot.y) * spriteInfo.sourceSize.y) * camera.currentZoom * realSize.y / spriteInfo.realSize.y
  );

  ctx.fillStyle = 'rgba(0,0,0)';
    ctx.fillRect(-2, -2, 4, 4);

    ctx.rotate((-lastPart.rotation + rotation)*Math.PI/180)
    ctx.scale(lastPart.scale.x * scale.x, lastPart.scale.y * scale.y)

    // TODO should be translation

    ctx.translate(
      (drawOffsetTransform.x / 2) * camera.currentZoom * realSize.x / spriteInfo.realSize.x,
      (drawOffsetTransform.y / 2) * camera.currentZoom * realSize.y / spriteInfo.realSize.y
    );
    


    /*
    ctx.translate(
      (spriteInfo.realSize.x / 2) * camera.currentZoom * realSize.x / spriteInfo.realSize.x,
      (spriteInfo.realSize.y / 1) * camera.currentZoom * realSize.y / spriteInfo.realSize.y
    );
    */
    

    /*
    ctx.translate(
      (lastPart.translation.x) * camera.currentZoom * realSize.x / spriteInfo.realSize.x,
      (lastPart.translation.y) * camera.currentZoom * realSize.y / spriteInfo.realSize.y
    );

    ctx.scale(lastPart.scale.x * scale.x, lastPart.scale.y * scale.y)
    ctx.rotate((lastPart.rotation + rotation)*Math.PI/180)

    ctx.translate(
      (spriteInfo.bboxMin.x / 2) * camera.currentZoom * realSize.x / spriteInfo.realSize.x,
      (spriteInfo.bboxMin.y / 2) * camera.currentZoom * realSize.y / spriteInfo.realSize.y
    );
    */

    /*
    ctx.translate(
      (spriteInfo.realSize.x / 2) * camera.currentZoom * realSize.x / spriteInfo.realSize.x,
      (spriteInfo.realSize.y / 1) * camera.currentZoom * realSize.y / spriteInfo.realSize.y
    )*/

    // Etape 4 : On applique les drawOffset (qui doivent profiter de la rotation et du scale)
    /*
    ctx.translate(
      (drawOffsetTotal.x) * camera.currentZoom * realSize.x / spriteInfo.realSize.x,
      (drawOffsetTotal.y) * camera.currentZoom * realSize.y / spriteInfo.realSize.y
    );
    */

        

    let colorReady = false;
    let imageBlack, imageRed, imageGreen, imageBlue: HTMLImageElement | HTMLCanvasElement;
    if (color != DrawHelpers.whiteColor)
    {
      imageBlack  = ImageSource.getImage(imageId + '_coloratlas_a');
      imageRed    = ImageSource.getImage(imageId + '_coloratlas_r');
      imageGreen  = ImageSource.getImage(imageId + '_coloratlas_g');
      imageBlue   = ImageSource.getImage(imageId + '_coloratlas_b');
      if (imageBlack != null && imageRed != null && imageGreen != null && imageBlue != null) colorReady = true;
      //else console.log('color asked but not ready')
    }

        
    let sx: number = spriteInfo.sourcePos.x;
    let sy: number = spriteInfo.sourcePos.y;
    let sw: number = spriteInfo.sourceSize.x;
    let sh: number = spriteInfo.sourceSize.y;

        /*
        if (colorReady)
        {
          
            let colors = DrawHelpers.hexToRgb(color);
            ctx.globalAlpha = alpha;
            ctx.drawImage(imageBlack, 
                spriteInfo.sourcePos.x, spriteInfo.sourcePos.y,
                spriteInfo.sourceSize.x, spriteInfo.sourceSize.y,
                -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);

            ctx.globalCompositeOperation = 'lighter';

            ctx.globalAlpha = colors[0] / 255 * alpha;
            ctx.drawImage(imageRed, 
                spriteInfo.sourcePos.x, spriteInfo.sourcePos.y,
                spriteInfo.sourceSize.x, spriteInfo.sourceSize.y,
                -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);
                
                
            ctx.globalAlpha = colors[1] / 255 * alpha;
            ctx.drawImage(imageGreen, 
                spriteInfo.sourcePos.x, spriteInfo.sourcePos.y,
                spriteInfo.sourceSize.x, spriteInfo.sourceSize.y,
                -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);
                
                
            ctx.globalAlpha = colors[2] / 255 * alpha;
            ctx.drawImage(imageBlue, 
                spriteInfo.sourcePos.x, spriteInfo.sourcePos.y,
                spriteInfo.sourceSize.x, spriteInfo.sourceSize.y,
                -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);
                
        }
        else
        {
            ctx.globalAlpha = alpha;
            ctx.drawImage(image, 
                spriteInfo.sourcePos.x, spriteInfo.sourcePos.y,
                spriteInfo.sourceSize.x, spriteInfo.sourceSize.y,
                -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);
        }
        */

        if (spriteInfo.uvMin != null && spriteInfo.uvMax != null)
        {
          sx = spriteInfo.uvMin.x;
          sy = spriteInfo.uvMin.y;
          sw = Math.abs(spriteInfo.uvMax.x - spriteInfo.uvMin.x);
          sh = Math.abs(spriteInfo.uvMax.y - spriteInfo.uvMin.y);

          // if (spriteInfo.spriteInfoId == 'generatormerc_kanim_place')
          // {
          //   console.log(sx);
          //   console.log(sy);
          //   console.log(sw);
          //   console.log(sh);
          // }
        }

       if (colorReady)
       {
         
           let colors = DrawHelpers.hexToRgb(color);
           ctx.globalAlpha = alpha;
           ctx.drawImage(imageBlack, 
               sx, sy,
               sw, sh,
               -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);

           ctx.globalCompositeOperation = 'lighter';

           ctx.globalAlpha = colors[0] / 255 * alpha;
           ctx.drawImage(imageRed, 
               sx, sy,
               sw, sh,
               -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);
               
               
           ctx.globalAlpha = colors[1] / 255 * alpha;
           ctx.drawImage(imageGreen, 
               sx, sy,
               sw, sh,
               -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);
               
               
           ctx.globalAlpha = colors[2] / 255 * alpha;
           ctx.drawImage(imageBlue, 
               sx, sy,
               sw, sh,
               -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);
               
       }
       else
       {
           ctx.globalAlpha = alpha;
           ctx.drawImage(image, 
               sx, sy,
               sw, sh,
               -halfRealSize.x, -halfRealSize.y, sizeCorrected.x, sizeCorrected.y);
       }
        

        ctx.restore();
    }

  public static drawDebugRectangle(ctx: CanvasRenderingContext2D, camera: Camera, topLeft: Vector2, bottomRight: Vector2, color: string)
  {
    let delta = 0.4;

    let rectanglePosition = new Vector2(
      (topLeft.x + delta + camera.cameraOffset.x) * camera.currentZoom,
      (-topLeft.y + delta + camera.cameraOffset.y) * camera.currentZoom
    );
    let rectangleSize = new Vector2(
      (bottomRight.x - topLeft.x + 1) * camera.currentZoom - 2*delta*camera.currentZoom,
      (topLeft.y - bottomRight.y + 1) * camera.currentZoom - 2*delta*camera.currentZoom
    );

    // Draw the debug rectangle
    ctx.fillStyle = color;
    ctx.fillRect(rectanglePosition.x, rectanglePosition.y, rectangleSize.x, rectangleSize.y);

    // Draw the debug retangle contour
    ctx.beginPath();
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 2;
    ctx.moveTo(rectanglePosition.x, rectanglePosition.y);
    ctx.lineTo(rectanglePosition.x + rectangleSize.x, rectanglePosition.y);
    ctx.lineTo(rectanglePosition.x + rectangleSize.x, rectanglePosition.y + rectangleSize.y);
    ctx.lineTo(rectanglePosition.x, rectanglePosition.y + rectangleSize.y);
    ctx.lineTo(rectanglePosition.x, rectanglePosition.y);
    ctx.stroke();
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

  public static connectionsToBoolArray(connections: number): boolean[]
  {
    let returnValue = [false, false, false, false];

    

    return returnValue;
  }
    
}