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
    public sourcePos: Vector2;
    public sourceSize: Vector2;
    public realSize: Vector2;
    public drawOffset: Vector2;
    public textureSize: Vector2;

    // New stuff
    public uvMin: Vector2;
    public uvMax: Vector2;
    
    bboxMin: Vector2;
    bboxMax: Vector2;

    pivot: Vector2;

    constructor(spriteInfoId: string)
    {
        this.spriteInfoId = spriteInfoId;
        this.cleanUp();
    }

    public cleanUp()
    {
        if (this.sourcePos == null) this.sourcePos = new Vector2();
        if (this.sourceSize == null) this.sourceSize = new Vector2();
        if (this.realSize == null) this.realSize = new Vector2();
        if (this.drawOffset == null) this.drawOffset = new Vector2();
    }

    private static spriteInfosMap: Map<string, SpriteInfo>;
    public static Init()
    {
      SpriteInfo.spriteInfosMap = new Map<string, SpriteInfo>();
    }

    public static AddSpriteInfo(bBuilding: BBuilding)
    {
      for (let sOriginal of bBuilding.spriteInfos)
      {
        let spriteInfo = new SpriteInfo(sOriginal.name);
        // TODO rename to imageId in export to be consistent
        spriteInfo.imageId = bBuilding.textureName;
        spriteInfo.uvMin = Vector2.clone(sOriginal.uvMin);
        spriteInfo.uvMax = Vector2.clone(sOriginal.uvMax);

        // TODO probably don't need bbox anymore
        spriteInfo.bboxMin = Vector2.clone(sOriginal.bboxMin);
        spriteInfo.bboxMax = Vector2.clone(sOriginal.bboxMax);
        spriteInfo.textureSize = Vector2.clone(sOriginal.textureSize);
        
        spriteInfo.realSize = new Vector2(
          bBuilding.sizeInCells.x * 100,
          bBuilding.sizeInCells.y * 100
        );

        spriteInfo.sourceSize = Vector2.clone(sOriginal.size);
        spriteInfo.pivot = Vector2.clone(sOriginal.pivot);

        SpriteInfo.spriteInfosMap.set(spriteInfo.spriteInfoId, spriteInfo); 
      }
    }

    // TODO: above should use this
    public static addSpriteInfo(spriteInfo: SpriteInfo)
    {
      SpriteInfo.spriteInfosMap.set(spriteInfo.spriteInfoId, spriteInfo); 
    }

    public copyFromSourceUv(sourceUv: BSourceUv)
    {
      this.imageId = sourceUv.textureName;
      this.uvMin = Vector2.clone(sourceUv.uvMin);
      this.uvMax = Vector2.clone(sourceUv.uvMax);
      this.sourceSize = Vector2.clone(sourceUv.size);
      this.pivot = Vector2.clone(sourceUv.pivot);
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
          this.sourceSize.x,
          this.sourceSize.y
        );

        this.texture = new PIXI.Texture(baseTex, rectangle);
      }

      return this.texture;
    }
}