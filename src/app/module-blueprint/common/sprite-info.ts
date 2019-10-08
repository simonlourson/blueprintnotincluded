import { Vector2 } from "src/app/module-blueprint/common/vector2";
import { BlueprintParams } from "./params";
import { BBuilding } from "./bexport/b-building";
import { BFrameElement } from "./bexport/b-frame-element";
import { BSourceUv } from "./bexport/b-source-uv";
import { BMatrix2x3 } from "./bexport/b-matrix";
import { ImageSource } from './image-source';
declare var PIXI: any;

export class SpriteInfo 
{
    public spriteInfoId: string;
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

    public copyFrom(original: SpriteInfo)
    {
        this.sourcePos = new Vector2();
        this.sourcePos.copyFrom(original.sourcePos);

        this.sourceSize = new Vector2();
        this.sourceSize.copyFrom(original.sourceSize);

        this.realSize = new Vector2();
        this.realSize.copyFrom(original.realSize);

        this.drawOffset = new Vector2();
        this.drawOffset.copyFrom(original.drawOffset);
    }

    public cleanUp()
    {
        if (this.sourcePos == null) this.sourcePos = new Vector2();
        if (this.sourceSize == null) this.sourceSize = new Vector2();
        if (this.realSize == null) this.realSize = new Vector2();
        if (this.drawOffset == null) this.drawOffset = new Vector2();
    }

    private static loadedDatabase = false;
    private static spriteInfosMap: Map<string, SpriteInfo>;
    public static Init()
    {
      SpriteInfo.spriteInfosMap = new Map<string, SpriteInfo>();

      /*
        let promise = new Promise((resolve, reject) => {
            SpriteInfo.spriteInfosMap = new Map<string, SpriteInfo>();

            fetch(BlueprintParams.apiUrl+'spriteInfos')
            .then(response => { return response.json() })
            .then(json => {
                let spriteInfosTemp: SpriteInfo[] = json;
                
                for (let spriteInfoTemp of spriteInfosTemp)
                {
                    let spriteInfo = new SpriteInfo(spriteInfoTemp.spriteInfoId);
                    spriteInfo.copyFrom(spriteInfoTemp);
                    spriteInfo.cleanUp();

                    SpriteInfo.spriteInfosMap.set(spriteInfo.spriteInfoId, spriteInfo);
                }

                SpriteInfo.loadedDatabase = true;
                resolve(0);
            })
            .catch(error => {
                SpriteInfo.loadedDatabase = true;
                reject(error);
            })
        });

        return promise;
        */
    }

    public static AddSpriteInfo(bBuilding: BBuilding)
    {
      for (let sOriginal of bBuilding.spriteInfos)
      {
        let spriteInfo = new SpriteInfo(sOriginal.name);
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

    public static FinishAddSpriteInfo()
    {
      //console.log(this.spriteInfosMap);
      SpriteInfo.loadedDatabase = true;
    }

    public static getSpriteInfo(spriteInfoId: string): SpriteInfo
    {
        let returnValue = SpriteInfo.spriteInfosMap.get(spriteInfoId);
        if (returnValue == null) 
        {
            returnValue = new SpriteInfo(spriteInfoId);
            returnValue.cleanUp();

            // If the database is already loaded, but we still didn't find the item, we can add it to the map
            if (SpriteInfo.loadedDatabase) SpriteInfo.spriteInfosMap.set(spriteInfoId, returnValue);
        }

        return returnValue;
    }


    // Pixi stuf
    texture: PIXI.Texture;
    public getTexture(imageId: string): PIXI.Texture
    {
      if (this.texture == null)
      {
        let baseTex = ImageSource.getBaseTexture(imageId);
        if (baseTex == null) return null;

        
        let rectangle = new PIXI.Rectangle(
          this.uvMin.x / 1,//this.textureSize.x,
          this.uvMin.y / 1,//this.textureSize.y,
          this.sourceSize.x / 1,//this.textureSize.x,
          this.sourceSize.y / 1,//this.textureSize.y
        );
        
       /*
        let rectangle = new PIXI.Rectangle(
          0,
          0,
          1,
          1
        )*/
        this.texture = new PIXI.Texture(baseTex, rectangle);
      }

      return this.texture;
    }
}