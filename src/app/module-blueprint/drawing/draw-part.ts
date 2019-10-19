import { SpriteInfo } from './sprite-info';
import { SpriteModifier } from '../common/sprite-modifier';

export class DrawPart
{
  public drawPartType: DrawPartType; 

  public spriteModifierId: string;
  solidSpriteModifier: SpriteModifier;
  solidSpriteInfo: SpriteInfo;

  prepareSpriteInfoModifier(spriteModifierId: string)
  {
    this.spriteModifierId = spriteModifierId;


  }

}

export enum DrawPartType
{
    Main,
    Solid,
    Left,
    Right,
    Up,
    Down
}