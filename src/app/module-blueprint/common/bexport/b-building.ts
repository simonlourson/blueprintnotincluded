import { Vector2 } from "../vector2";
import { BSpriteInfo } from "./b-sprite-info";
import { BSpriteModifier } from "./b-sprite-modifier";
import { UtilityConnection } from '../utility-connection';
import { ZIndex, Overlay } from '../overlay-type';
import { PermittedRotations } from '../../drawing/draw-helpers';

export class BBuilding
{
  name: string;
  prefabId: string;
  isTile: boolean;
  isUtility: boolean;
  sizeInCells: Vector2;
  sceneLayer: ZIndex;
  viewMode: Overlay;
  backColor: number;
  frontColor: number;

  kanimPrefix: string;
  textureName: string;

  spriteInfos: BSpriteInfo[];
  spriteModifiers : BSpriteModifier[];
  utilities: UtilityConnection[];
  materialCategory: string[];

  dragBuild: boolean;
  objectLayer: number;
  permittedRotations: PermittedRotations;
}