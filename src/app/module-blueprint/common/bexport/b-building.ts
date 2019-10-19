import { Vector2 } from "../vector2";
import { BSpriteInfo } from "./b-sprite-info";
import { BSpriteModifier } from "./b-sprite-modifier";
import { UtilityConnection } from '../utility-connection';
import { OverlayType } from '../overlay-type';

export class BBuilding
{
  name: string;
  prefabId: string;
  isTile: boolean;
  isUtility: boolean;
  sizeInCells: Vector2;
  sceneLayer: OverlayType;

  kanimPrefix: string;
  textureName: string;

  spriteInfos: BSpriteInfo[];
  spriteModifiers : BSpriteModifier[];
  utilities: UtilityConnection[];
}