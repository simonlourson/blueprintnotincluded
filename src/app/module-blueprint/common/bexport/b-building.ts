import { Vector2 } from "../vector2";
import { BSpriteInfo } from "./b-sprite-info";
import { BSpriteModifier } from "./b-sprite-modifier";
import { UtilityConnection } from '../utility-connection';
import { ZIndex, Overlay } from '../overlay-type';

export class BBuilding
{
  name: string;
  prefabId: string;
  isTile: boolean;
  isUtility: boolean;
  sizeInCells: Vector2;
  sceneLayer: ZIndex;
  viewMode: Overlay;
  color: number;

  kanimPrefix: string;
  textureName: string;

  spriteInfos: BSpriteInfo[];
  spriteModifiers : BSpriteModifier[];
  utilities: UtilityConnection[];
}