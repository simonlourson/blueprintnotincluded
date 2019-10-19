import { Vector2 } from "./vector2";
import { BlueprintParams } from "./params";
import { BBuilding } from "./bexport/b-building";
import { SpriteModifierPart } from "./sprite-modifier-part";
import { BSpriteModifier } from "./bexport/b-sprite-modifier";
import { DrawHelpers } from '../drawing/draw-helpers';

export class SpriteModifier
{
    spriteModifierId: string;

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
      
      for (let part of bSPriteModifier.parts)
      {
        let newPart = new SpriteModifierPart();
        newPart.importFrom(part);
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

      if (bBuilding.isTile)
      {
        for (let indexConnection = 0; indexConnection <= 15; indexConnection++)
        {
          let connectionModifier: SpriteModifier = new SpriteModifier(bBuilding.kanimPrefix + DrawHelpers.connectionString[indexConnection]);
          let connectionModifierPart: SpriteModifierPart = new SpriteModifierPart();

          connectionModifier.parts.push(connectionModifierPart);
          connectionModifierPart.cleanUp();
          connectionModifierPart.translation.y = 50;
          connectionModifierPart.spriteInfoName = bBuilding.kanimPrefix + DrawHelpers.connectionString[indexConnection];

          SpriteModifier.spriteModifiersMap.set(connectionModifier.spriteModifierId, connectionModifier);
        }
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
    public static init()
    {
      SpriteModifier.spriteModifiersMap = new Map<string, SpriteModifier>();
    }

    public static getSpriteModifer(spriteModifierId: string): SpriteModifier
    {
        let returnValue = SpriteModifier.spriteModifiersMap.get(spriteModifierId);
        
        /* TODO everything should have a modifier
        if (returnValue == null) 
        {
            returnValue = new SpriteModifier(spriteModifierId);
            returnValue.cleanUp();
            SpriteModifier.spriteModifiersMap.set(spriteModifierId, returnValue);
        }
        */

        return returnValue;
    }
}