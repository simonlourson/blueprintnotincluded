import { Vector2 } from "./vector2";
import { BlueprintParams } from "./params";
import { BBuilding } from "./bexport/b-building";
import { SpriteModifierPart } from "./sprite-modifier-part";
import { BSpriteModifier } from "./bexport/b-sprite-modifier";

export class SpriteModifier
{
    spriteModifierId: string;
    framebboxMin: Vector2;
    framebboxMax: Vector2;

    parts: SpriteModifierPart[];

    

    public static defaultModifier: SpriteModifier = new SpriteModifier('default');


    constructor(spriteModifierId: string)
    {
        this.spriteModifierId = spriteModifierId;
        this.cleanUp();
    }

    public importFromC(bSPriteModifier: BSpriteModifier)
    {
      this.parts = [];
      this.framebboxMin = new Vector2(bSPriteModifier.framebboxMin.x, bSPriteModifier.framebboxMin.y);
      this.framebboxMax = new Vector2(bSPriteModifier.framebboxMax.x, bSPriteModifier.framebboxMax.y);

      for (let part of bSPriteModifier.parts)
      {
        let newPart = new SpriteModifierPart();
        newPart.importFromC(part);
        this.parts.push(newPart);
      }
    }

    public static AddSpriteModifier(bBuilding: BBuilding)
    {
      for (let sOriginal of bBuilding.spriteModifiers)
      {
        let spriteModifier = new SpriteModifier(sOriginal.name);
        spriteModifier.importFromC(sOriginal);

        SpriteModifier.spriteModifiersMap.set(spriteModifier.spriteModifierId, spriteModifier);
      }
    }

    public getLastPart(): SpriteModifierPart
    {
      if (this.parts.length > 0) return this.parts[this.parts.length - 1];
      else return null;
    }

    public cleanUp()
    {
      this.parts = [];
    }

    private static spriteModifiersMap: Map<string, SpriteModifier>;
    public static Init()
    {
        let promise = new Promise((resolve, reject) => {
            SpriteModifier.spriteModifiersMap = new Map<string, SpriteModifier>();

            /*
            //fetch("/assets/database/spriteModifiers.json")
            fetch(BlueprintParams.apiUrl+'spriteModifiers')
            .then(response => { return response.json() })
            .then(json => {
                let spriteModifiersTemp: SpriteModifier[] = json;
                
                for (let spriteModifierTemp of spriteModifiersTemp)
                {

                    let spriteModifier = new SpriteModifier(spriteModifierTemp.spriteModifierId);
                    spriteModifier.spriteInfoSuffix = spriteModifierTemp.spriteInfoSuffix;
                    spriteModifier.rotation = spriteModifierTemp.rotation;
                    spriteModifier.scale = Vector2.clone(spriteModifierTemp.scale);

                    spriteModifier.cleanUp();
                    SpriteModifier.spriteModifiersMap.set(spriteModifier.spriteModifierId, spriteModifier);

                    
                    resolve(0);
                }

            })
            .catch((error) => {
                reject(error);
            })

            */
        });

        return promise;
    }

    public static getSpriteModifer(spriteModifierId: string): SpriteModifier
    {
        let returnValue = SpriteModifier.spriteModifiersMap.get(spriteModifierId);
        if (returnValue == null) 
        {
            returnValue = new SpriteModifier(spriteModifierId);
            returnValue.cleanUp();
            SpriteModifier.spriteModifiersMap.set(spriteModifierId, returnValue);
        }

        return returnValue;
    }
}