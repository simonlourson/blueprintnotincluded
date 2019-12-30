import { SpriteInfo } from './sprite-info';
import { SpriteModifier, SpriteTag } from './sprite-modifier';
import { CameraService } from '../services/camera-service';
import { DrawPixi } from './draw-pixi';
import { OniItem } from '../common/oni-item';
import { Vector2 } from '../common/vector2';
import { DrawHelpers } from './draw-helpers';
import { Display } from '../common/overlay-type';

export class DrawPart
{
  spriteModifier: SpriteModifier;
  spriteInfo: SpriteInfo;
  sprite: PIXI.Sprite;

  alpha: number;
  tint: number;
  zIndex: number;

  visible: boolean;

  selected: boolean;

  isReady: boolean;

  public constructor()
  {
    this.isReady = false;
    this.alpha = 1;
    this.tint = 0xFFFFFF;
  }

  public prepareSprite(camera: CameraService, container: PIXI.Container, oniItem: OniItem) {

    if (this.sprite == null) {
      if (this.spriteModifier != null)
        this.spriteInfo = SpriteInfo.getSpriteInfo(this.spriteModifier.spriteInfoName);

      let texture: PIXI.Texture;
      if (this.spriteInfo != null)
        texture = this.spriteInfo.getTexture();
    
      if (texture != null) 
      {
        // TODO Invert pivoTY in export
        this.sprite = PIXI.Sprite.from(texture);
        this.sprite.anchor.set(this.spriteInfo.pivot.x, 1-this.spriteInfo.pivot.y);
        this.sprite.zIndex = this.zIndex;

        container.addChild(this.sprite);
        this.isReady = true;
      }
    }

    if (this.sprite != null)
    {
      //this.sprite.texture = this.spriteInfo.getTexture();
      //this.sprite.anchor.set(this.spriteInfo.pivot.x, 1-this.spriteInfo.pivot.y);

      // TODO this feels like it should be in the container  
      let sizeCorrected = new Vector2(
        camera.currentZoom / 100 * this.spriteInfo.realSize.x,
        camera.currentZoom / 100 * this.spriteInfo.realSize.y
      );

      let tileOffset: Vector2 = new Vector2(
        oniItem.size.x % 2 == 0 ? 50 : 0,
        -50
      );

      this.sprite.visible = this.visible;

      // TODO invert translation in export
      // TODO this feels like it should be in the container
      this.sprite.x = 0 + (this.spriteModifier.translation.x + tileOffset.x) * 1;//camera.currentZoom / 100;
      this.sprite.y = 0 - (this.spriteModifier.translation.y + tileOffset.y) * 1;//camera.currentZoom / 100;
      
      this.sprite.alpha = this.alpha;
      this.sprite.zIndex = this.zIndex;

      this.sprite.scale.x = this.spriteModifier.scale.x;
      this.sprite.scale.y = this.spriteModifier.scale.y;
      // TODO invert rotation in export
      this.sprite.angle = -this.spriteModifier.rotation;

      // TODO this feels like it should be in the container
      //this.sprite.width = sizeCorrected.x;
      //this.sprite.height = sizeCorrected.y;
      this.sprite.width = this.spriteInfo.realSize.x;
      this.sprite.height = this.spriteInfo.realSize.y;

    }
  }

  public hasTag(tag: SpriteTag) {
    return this.spriteModifier.hasTag(tag);
  }

  prepareVisibilityBasedOnDisplay(newDisplay: Display) {
    let tagFilter = newDisplay == Display.blueprint ? SpriteTag.place : SpriteTag.solid;

    if (this.spriteModifier == null) this.visible = false;
    else if (!this.hasTag(tagFilter)) this.visible = false;
    else this.visible = true;
  } 

  makeEverythingButThisTagInvisible(tagFilter: SpriteTag) {
    if (this.spriteModifier == null) this.visible = false;
    else if (!this.hasTag(tagFilter)) this.visible = false;
    else this.visible = this.visible && true;
  } 

  makeInvisibileIfHasTag(tagFilter: SpriteTag) {
    if (this.hasTag(tagFilter)) this.visible = false;
  }

  makeVisibileIfHasTag(tagFilter: SpriteTag) {
    if (this.hasTag(tagFilter)) this.visible = true;
  }

  public addToContainer(container: PIXI.Container) {
    if (this.spriteModifier != null)
      this.spriteInfo = SpriteInfo.getSpriteInfo(this.spriteModifier.spriteInfoName);

    
  }

  public getPreparedSprite(camera: CameraService, oniItem: OniItem): PIXI.Sprite
  {
    
    

    if (this.sprite == null)
    {
      let texture: PIXI.Texture;

      if (this.spriteInfo != null)
        texture = this.spriteInfo.getTexture();

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
      
      this.sprite.alpha = this.alpha;

      if (this.selected)
        this.sprite.tint = DrawHelpers.blendColor(this.tint, 0x4CFF00, camera.sinWave);
      else
        this.sprite.tint = this.tint;

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