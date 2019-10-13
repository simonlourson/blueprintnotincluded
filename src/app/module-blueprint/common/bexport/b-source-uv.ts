import { Vector2 } from "../vector2";

export class BSourceUv
{
  name: string;
  textureName: string;

  uvMin: Vector2;
  uvMax: Vector2;
  textureSize: Vector2;

  bboxMin: Vector2;
  bboxMax: Vector2;
  
  pivot: Vector2;
  size: Vector2;
}