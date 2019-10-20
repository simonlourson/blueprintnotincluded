import { Vector2 } from "../common/vector2";
import { BlueprintParams } from "../common/params";
import { BBuilding } from "../common/bexport/b-building";
import { BSpriteModifier } from "../common/bexport/b-sprite-modifier";
import { DrawHelpers } from './draw-helpers';

export class SpriteModifier
{
    spriteModifierId: string;
    spriteInfoName: string;

    rotation: number;
    scale: Vector2;
    translation: Vector2;

    

    public static defaultModifier: SpriteModifier = new SpriteModifier('default');


    constructor(spriteModifierId: string)
    {
        this.spriteModifierId = spriteModifierId;
        this.cleanUp();
    }

    public importFrom(original: BSpriteModifier)
    {
      this.spriteInfoName = original.spriteInfoName;

      this.translation = original.translation;
      this.scale = original.scale;
      this.rotation = original.rotation;
    }

    public static AddSpriteModifier(bBuilding: BBuilding)
    {

    }

    public static addTileSpriteModifier(kanimPrefix: string)
    {
      for (let indexConnection = 0; indexConnection <= 15; indexConnection++)
      {
        let connectionModifier: SpriteModifier = new SpriteModifier(kanimPrefix + DrawHelpers.connectionString[indexConnection]);
        
        connectionModifier.cleanUp();
        connectionModifier.translation.y = 50;
        connectionModifier.spriteInfoName = kanimPrefix + DrawHelpers.connectionString[indexConnection];

        SpriteModifier.spriteModifiersMap.set(connectionModifier.spriteModifierId, connectionModifier);
      }
    }

    public cleanUp()
    {
      if (this.rotation == null) this.rotation = 0;
      if (this.scale == null) this.scale = Vector2.clone(Vector2.One);
      if (this.translation == null) this.translation = Vector2.clone(Vector2.Zero);
    }

    private static spriteModifiersMap: Map<string, SpriteModifier>;
    public static init()
    {
      SpriteModifier.spriteModifiersMap = new Map<string, SpriteModifier>();
    }

    public static load(spriteModifiers: BSpriteModifier[])
    {
      for (let original of spriteModifiers)
      {
        let spriteModifier = new SpriteModifier(original.name);
        spriteModifier.cleanUp();
        spriteModifier.importFrom(original);

        SpriteModifier.spriteModifiersMap.set(spriteModifier.spriteModifierId, spriteModifier);
      }

      console.log(SpriteModifier.spriteModifiersMap);
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