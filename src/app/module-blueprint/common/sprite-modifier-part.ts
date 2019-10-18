import { Vector2 } from "./vector2";
import { BMatrix2x3 } from "./bexport/b-matrix";
import { BSpriteModifierPart } from "./bexport/b-sprite-modifier-part";

export class SpriteModifierPart
{
  spriteInfoName: string;
  rotation: number;
  scale: Vector2;
  translation: Vector2;


  public importFromC(part: BSpriteModifierPart)
  {
    this.spriteInfoName = part.spriteInfoName;

    this.translation = part.translation;
    this.scale = part.scale;
    this.rotation = part.rotation;
  }

  public cleanUp()
  {
      if (this.rotation == null) this.rotation = 0;
      if (this.scale == null) this.scale = Vector2.clone(Vector2.One);
      if (this.translation == null) this.translation = Vector2.clone(Vector2.Zero);
  }
}