import { Vector2 } from "../vector2";

export class BSpriteInfo
{
  name: string;
  textureName: string;
  isIcon: boolean;

  uvMin: Vector2;
  uvSize: Vector2;
  realSize: Vector2;

  pivot: Vector2;
}