import { Vector2 } from "src/app/module-blueprint/common/vector2";
import { BlueprintParams } from "../common/params";
import { BBuilding } from "../common/bexport/b-building";
import { BFrameElement } from "../common/bexport/b-frame-element";
import { BSourceUv } from "../common/bexport/b-source-uv";
import { BMatrix2x3 } from "../common/bexport/b-matrix";
import { ImageSource } from './image-source';
declare var PIXI: any;

export class SpriteInfo 
{
    public spriteInfoId: string;
    public imageId: string;

    // New stuff
    public uvMin: Vector2;
    public uvSize: Vector2;
    public realSize: Vector2;
    public pivot: Vector2;
    public isIcon: boolean;

    constructor(spriteInfoId: string)
    {
        this.spriteInfoId = spriteInfoId;
        this.cleanUp();
    }

    public cleanUp()
    {
    }

    private static spriteInfosMap: Map<string, SpriteInfo>;
    public static keys: string[];
    public static Init()
    {
      SpriteInfo.keys = [];
      SpriteInfo.spriteInfosMap = new Map<string, SpriteInfo>();
    }

    public static AddSpriteInfo(bBuilding: BBuilding)
    {
      for (let sOriginal of bBuilding.spriteInfos)
      {
        let spriteInfo = new SpriteInfo(sOriginal.name);
        spriteInfo.copyFromSourceUv(sOriginal);
        // TODO rename to imageId in export to be consistent
        
        SpriteInfo.addSpriteInfo(spriteInfo);
      }
    }

    public static addSpriteInfo(spriteInfo: SpriteInfo)
    {
      SpriteInfo.keys.push(spriteInfo.spriteInfoId);
      SpriteInfo.spriteInfosMap.set(spriteInfo.spriteInfoId, spriteInfo); 
    }

    public copyFromSourceUv(sourceUv: BSourceUv)
    {
      // TODO refactor
      let imageUrl: string = 'assets/images/'+sourceUv.textureName+'.png';
      ImageSource.AddImagePixi(sourceUv.textureName, imageUrl);
      this.imageId = sourceUv.textureName;
      this.uvMin = Vector2.clone(sourceUv.uvMin);
      this.uvSize = Vector2.clone(sourceUv.uvSize);
      this.realSize = Vector2.clone(sourceUv.realSize);
      this.pivot = Vector2.clone(sourceUv.pivot);
      this.isIcon = sourceUv.isIcon;
    }

    public static getSpriteInfo(spriteInfoId: string): SpriteInfo
    {
        let returnValue = SpriteInfo.spriteInfosMap.get(spriteInfoId);
        return returnValue;
    }


    // Pixi stuf
    texture: PIXI.Texture;
    public getTexture(): PIXI.Texture
    {
      if (this.texture == null)
      {
        let baseTex = ImageSource.getBaseTexture(this.imageId);
        if (baseTex == null) return null;

        let rectangle = new PIXI.Rectangle(
          this.uvMin.x,
          this.uvMin.y,
          this.uvSize.x,
          this.uvSize.y
        );

        this.texture = new PIXI.Texture(baseTex, rectangle);
      }

      return this.texture;
    }
}