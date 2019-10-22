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

  // Used when repacking textures
  static clone(source: BSpriteInfo): BSpriteInfo
  {
    let returnValue: BSpriteInfo = new BSpriteInfo();

    returnValue.name = source.name;
    returnValue.textureName = source.textureName;
    returnValue.isIcon = source.isIcon;
    returnValue.uvMin = Vector2.clone(source.uvMin);
    returnValue.uvSize = Vector2.clone(source.uvSize);
    returnValue.realSize = Vector2.clone(source.realSize);
    returnValue.pivot = Vector2.clone(source.pivot);

    return returnValue;
  }
}