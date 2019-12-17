import { SpriteModifier, SpriteTag } from './sprite-modifier';
import { BSpriteGroup } from '../common/bexport/b-building';

export class SpriteModifierGroup {
  groupName: string;
  spriteModifiers: SpriteModifier[];

  constructor(groupName: string) {
    this.groupName = groupName;
  }

  getModifierFromTag(tag: SpriteTag) {
    for (let spriteModifier of this.spriteModifiers)
      if (spriteModifier.tag == tag)
        return spriteModifier;

    return null;
  }

  static copyFrom(original: BSpriteGroup) {
    let returnValue = new SpriteModifierGroup(original.groupName);

    returnValue.spriteModifiers = [];
    
    for (let spriteName of original.spriteNames) {
      let spriteModifier = SpriteModifier.getSpriteModifer(spriteName);
      if (spriteModifier != null) returnValue.spriteModifiers.push(spriteModifier);
    }
      

    return returnValue;
  }
}