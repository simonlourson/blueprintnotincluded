import { Vector2 } from "../vector2";
import { BSpriteInfo } from "./b-sprite-info";
import { BSpriteModifier } from "./b-sprite-modifier";
import { UtilityConnection } from '../utility-connection';
import { ZIndex, Overlay } from '../overlay-type';
import { PermittedRotations } from '../../drawing/draw-helpers';
import { BUiScreen } from './b-ui-screen';

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
  materialMass: number[];
  uiScreens: BUiScreen[];
  sprites: BSpriteGroup;

  dragBuild: boolean;
  objectLayer: number;
  permittedRotations: PermittedRotations;

  tileableLeftRight:boolean;
  tileableTopBottom: boolean;
}

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