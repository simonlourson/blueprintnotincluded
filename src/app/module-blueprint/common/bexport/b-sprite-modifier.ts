import { BSpriteModifierPart } from "./b-sprite-modifier-part";
import { Vector2 } from "../vector2";

export class BSpriteModifier
{
  name: string;
  framebboxMin: Vector2;
  framebboxMax: Vector2;
  parts: BSpriteModifierPart[];
}