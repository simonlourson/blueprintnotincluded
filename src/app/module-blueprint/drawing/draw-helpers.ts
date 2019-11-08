import { Vector2 } from "../common/vector2";
import { CameraService } from "../services/camera-service";
import { SpriteInfo } from "./sprite-info";
import { SpriteModifier } from "./sprite-modifier";
import { ImageSource } from "./image-source";
import { BSpriteInfo } from '../common/bexport/b-sprite-info';

export class DrawHelpers
{
  public static whiteColor: number = 0xFFFFFF;

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

  public static drawFullRectangle(ctx: CanvasRenderingContext2D, camera: CameraService, topLeft: Vector2, bottomRight: Vector2, color: string)
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

  public static blendColor (a: number, b: number, ratio: number) {
    if (ratio > 1) ratio = 1;
    else if (ratio < 0) ratio = 0;
    
    let iRatio = 1 - ratio;

    let aR = ((a & 0xff0000) >> 16);
    let aG = ((a & 0xff00) >> 8);
    let aB = (a & 0xff);

    let bR = ((b & 0xff0000) >> 16);
    let bG = ((b & 0xff00) >> 8);
    let bB = (b & 0xff);

    let R = Math.round((aR * iRatio) + (bR * ratio));
    let G = Math.round((aG * iRatio) + (bG * ratio));
    let B = Math.round((aB * iRatio) + (bB * ratio));

    return R << 16 | G << 8 | B;
  }
  
  public static generateTileSpriteInfo(kanimPrefix: string, textureName: string): BSpriteInfo[]
  {
    let returnValue: BSpriteInfo[] = []

    let rIndex = 0;
    let uIndex = 0;
    let dIndex = 0;
    let l = false;
    let r = false;
    let u = false;
    let d = false;

    let motifStart: number = 40;
    let currentUv: Vector2 = new Vector2(motifStart, motifStart);

    let size: number = 128;
    let uvSize: Vector2 = new Vector2(size, size);
    
    let margin: number = 30;
    let motifRepeatedEvery: number = 208;
    let deltaPivot = margin / (2 * size + 2 * margin); // Do the math lol

    for (let i = 0; i <= 15; i++)
    {
      let newSourceUv = new BSpriteInfo();
      returnValue.push(newSourceUv);
      newSourceUv.name = kanimPrefix;
      newSourceUv.textureName = textureName;

      //console.log(l+';'+r+';'+u+';'+d);

      let pivot = new Vector2(0.5, 0.5);
      let uv: Vector2 = Vector2.clone(currentUv);
      let size: Vector2 = Vector2.clone(uvSize);
      
      if (!l && !r && !u && !d) newSourceUv.name = newSourceUv.name + 'None';

      if (l) newSourceUv.name = newSourceUv.name + 'L';
      else {
        uv.x -= margin;
        size.x += margin;
        pivot.x += deltaPivot;
      }
      if (r) newSourceUv.name = newSourceUv.name + 'R';
      else {
        size.x += margin;
        pivot.x -= deltaPivot;
      }
      if (u) newSourceUv.name = newSourceUv.name + 'U';
      else {
        uv.y -= margin;
        size.y += margin;
        pivot.y -= deltaPivot;
      }
      if (d) newSourceUv.name = newSourceUv.name + 'D';
      else {
        size.y += margin;
        pivot.y += deltaPivot;
      }

      
      newSourceUv.name = newSourceUv.name + '_place';
      
      newSourceUv.uvMin = Vector2.clone(uv);
      newSourceUv.uvSize = Vector2.clone(size);
      newSourceUv.realSize = new Vector2(size.x / 1.28, size.y / 1.28);
      newSourceUv.pivot = Vector2.clone(pivot);

      //console.log(newSourceUv);

      /*
      console.log(uv);
      console.log(size);
      console.log(pivot);
      */

      l = !l;

      rIndex = (rIndex + 1) % 8;
      if (rIndex == 0) r = !r;

      uIndex = (uIndex + 1) % 2;
      if (uIndex == 0) u = !u;

      dIndex = (dIndex + 1) % 4;
      if (dIndex == 0) d = !d;

      currentUv.y += motifRepeatedEvery;
      if (currentUv.y == motifStart + 4 * motifRepeatedEvery)
      {
        currentUv.y = motifStart;
        currentUv.x += motifRepeatedEvery;
      }
    }

    return returnValue;
  }

  static connectionString: string[] = [
    'None_place',
    'L_place',
    'R_place',
    'LR_place',
    'U_place',
    'LU_place',
    'RU_place',
    'LRU_place',
    'D_place',
    'LD_place',
    'RD_place',
    'LRD_place',
    'UD_place',
    'LUD_place',
    'RUD_place',
    'LRUD_place'
  ];

  static connectionStringSolid: string[] = [
    'None',
    'L',
    'R',
    'LR',
    'U',
    'LU',
    'RU',
    'LRU',
    'D',
    'LD',
    'RD',
    'LRD',
    'UD',
    'LUD',
    'RUD',
    'LRUD'
  ];
}