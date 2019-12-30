import { BSpriteInfo } from './b-sprite-info';
import { BBuilding } from './b-building';
import { BSpriteModifier } from './b-sprite-modifier';
import { BuildMenuCategory, BuildMenuItem } from './b-build-order';
import { BuildableElement } from './b-element';

// The exported database from the game
export interface BExport {
  buildings: BBuilding[];
  uiSprites: BSpriteInfo[];
  spriteModifiers: BSpriteModifier[];
  buildMenuCategories: BuildMenuCategory[];
  buildMenuItems: BuildMenuItem[];
  elements: BuildableElement[];
}