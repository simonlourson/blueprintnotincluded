import { Vector2 } from "../vector2";
import { BSpriteInfo } from "./b-sprite-info";
import { BSpriteModifier } from "./b-sprite-modifier";
import { UtilityConnection } from '../utility-connection';
import { ZIndex, Overlay } from '../overlay-type';
import { PermittedRotations } from '../../drawing/draw-helpers';
import { BUiScreen } from './b-ui-screen';

// A building (exported from the game)
export class BBuilding
{
  name: string;
  prefabId: string;
  isTile: boolean;
  isUtility: boolean;
  isBridge: boolean;
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
  materialMass: number[];
  uiScreens: BUiScreen[];
  sprites: BSpriteGroup;

  dragBuild: boolean;
  objectLayer: number;
  permittedRotations: PermittedRotations;

  tileableLeftRight:boolean;
  tileableTopBottom: boolean;
}

// All sprites for a building
// TODO since all sprites for a building are inside the same group, we don't need this class anymore. spriteNames should go directly into the BBuilding class
export class BSpriteGroup {
  groupName: string;
  spriteNames: string[];

  constructor(groupName: string) {
    this.groupName = groupName;
  }

  static clone(original: BSpriteGroup) {
    let returnValue = new BSpriteGroup(original.groupName);

    returnValue.spriteNames = [];
    for (let spriteName of original.spriteNames) returnValue.spriteNames.push(spriteName);

    return returnValue;
  }
}