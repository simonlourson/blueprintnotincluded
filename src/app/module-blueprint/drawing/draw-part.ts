import { SpriteInfo } from './sprite-info';
import { SpriteModifier } from './sprite-modifier';
import { Camera } from '../common/camera';
import { DrawPixi } from './draw-pixi';
import { OniItem } from '../common/oni-item';
import { Vector2 } from '../common/vector2';

export class DrawPart
{
  public drawPartType: DrawPartType; 
  public addedToContainer;

  spriteModifierId: string;
  spriteModifier: SpriteModifier;
  spriteInfo: SpriteInfo;
  sprite: PIXI.Sprite;

  public DrawPart()
  {
    this.addedToContainer = false;
  }

  prepareSpriteInfoModifier(spriteModifierId: string)
  {
    this.spriteModifierId = spriteModifierId;
  }

  public getPreparedSprite(camera: Camera, drawPixi: DrawPixi, oniItem: OniItem): PIXI.Sprite
  {
    this.spriteModifier = SpriteModifier.getSpriteModifer(this.spriteModifierId);
    this.spriteInfo = SpriteInfo.getSpriteInfo(this.spriteModifier.spriteInfoName);

    if (this.sprite == null)
    {
      let texture = this.spriteInfo.getTexture();

      if (texture != null) 
      {
        // TODO Invert pivoTY in export
        this.sprite = PIXI.Sprite.from(texture);
        this.sprite.anchor.set(this.spriteInfo.pivot.x, 1-this.spriteInfo.pivot.y);
      }
    }

    if (this.sprite != null)
    {
      this.sprite.texture = this.spriteInfo.getTexture();
      this.sprite.anchor.set(this.spriteInfo.pivot.x, 1-this.spriteInfo.pivot.y);

          
      let sizeCorrected = new Vector2(
        camera.currentZoom / 100 * this.spriteInfo.realSize.x,
        camera.currentZoom / 100 * this.spriteInfo.realSize.y
      );

      let tileOffset: Vector2 = new Vector2(
        oniItem.size.x % 2 == 0 ? 50 : 0,
        -50
      );

      // TODO invert translation in export
      this.sprite.x = 0 + (this.spriteModifier.translation.x + tileOffset.x) * camera.currentZoom / 100;
      this.sprite.y = 0 - (this.spriteModifier.translation.y + tileOffset.y) * camera.currentZoom / 100;
      


      this.sprite.scale.x = this.spriteModifier.scale.x;
      this.sprite.scale.y = this.spriteModifier.scale.y;
      // TODO invert rotation in export
      this.sprite.angle = -this.spriteModifier.rotation;
      this.sprite.width = sizeCorrected.x;
      this.sprite.height = sizeCorrected.y;

    }

    return this.sprite;
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