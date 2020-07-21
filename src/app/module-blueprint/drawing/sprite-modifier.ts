import { BBuilding, BSpriteModifier, Vector2, SpriteTag } from '../../../../../blueprintnotincluded-lib/index'
import { BlueprintParams } from "../common/params";

export class SpriteModifier
{
  spriteModifierId: string;
  spriteInfoName: string;
  tags: SpriteTag[];

  rotation: number;
  scale: Vector2;
  translation: Vector2;

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

    this.tags = [];
    if (original.tags != null && original.tags.length > 0)
      for (let tag of original.tags) this.tags.push(tag);
  }

  public cleanUp()
  {
    if (this.rotation == null) this.rotation = 0;
    if (this.scale == null) this.scale = Vector2.clone(Vector2.One);
    if (this.translation == null) this.translation = Vector2.clone(Vector2.Zero);
    if (this.tags == null) this.tags = [];
  }

  public hasTag(tag: SpriteTag) {
    return this.tags.indexOf(tag) != -1;
  }

  public static AddSpriteModifier(bBuilding: BBuilding)
  {

  }

  public static get spriteModifiers() { return Array.from(SpriteModifier.spriteModifiersMap.values()); }
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

