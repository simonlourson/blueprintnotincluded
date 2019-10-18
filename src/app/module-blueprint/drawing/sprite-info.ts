import { Vector2 } from "src/app/module-blueprint/common/vector2";
import { BlueprintParams } from "../common/params";
import { BBuilding } from "../common/bexport/b-building";
import { BFrameElement } from "../common/bexport/b-frame-element";
import { BSourceUv } from "../common/bexport/b-source-uv";
import { BMatrix2x3 } from "../common/bexport/b-matrix";
import { ImageSource } from './image-source';
import { DrawHelpers } from './draw-helpers';
import { TemplateItemTile } from '../common/template/template-item-tile';
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

    // TODO not sure if keys is absolutely necessary here
    private static spriteInfosMap: Map<string, SpriteInfo>;
    public static keys: string[];
    public static init()
    {
      SpriteInfo.keys = [];
      SpriteInfo.spriteInfosMap = new Map<string, SpriteInfo>();
    }

    public static load(uiSprites: BSourceUv[])
    {
      for (let uiSprite of uiSprites)
      {
        let newUiSpriteInfo = new SpriteInfo(uiSprite.name);
        newUiSpriteInfo.copyFromSourceUv(uiSprite);

        let imageUrl: string = DrawHelpers.createUrl(newUiSpriteInfo.imageId, false);
        ImageSource.AddImagePixi(newUiSpriteInfo.imageId, imageUrl)
        
        SpriteInfo.addSpriteInfo(newUiSpriteInfo);
      }
    }

    public static AddSpriteInfo(bBuilding: BBuilding)
    {
      SpriteInfo.AddSpriteInfoArray(bBuilding.spriteInfos);

      if (bBuilding.isTile)
      {
        let generatedSprites: BSourceUv[] = DrawHelpers.generateTileSpriteInfo(bBuilding.kanimPrefix, bBuilding.textureName);
        SpriteInfo.AddSpriteInfoArray(generatedSprites);
      }
    }

    // TODO should this be here?
    private static AddSpriteInfoArray(sourceArray: BSourceUv[])
    {
      for (let sOriginal of sourceArray)
      {
        let spriteInfo = new SpriteInfo(sOriginal.name);
        spriteInfo.copyFromSourceUv(sOriginal);
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
      let imageUrl: string = DrawHelpers.createUrl(sourceUv.textureName, false);
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