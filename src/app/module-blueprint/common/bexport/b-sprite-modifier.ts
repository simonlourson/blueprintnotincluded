import { Vector2 } from "../vector2";
import { SpriteTag } from '../../drawing/sprite-modifier';

export class BSpriteModifier
{
  name: string;
  spriteInfoName: string;

  translation: Vector2;
  scale: Vector2;
  rotation: number;
  tags: SpriteTag[];
}