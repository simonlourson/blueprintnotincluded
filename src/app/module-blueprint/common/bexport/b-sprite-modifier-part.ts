import { BMatrix2x3 } from "./b-matrix";
import { Vector2 } from "../vector2";

export class BSpriteModifierPart
{
  spriteInfoName: string;
  transform: BMatrix2x3;

  translation: Vector2;
  scale: Vector2;
  rotation: number;
}