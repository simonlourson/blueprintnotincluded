import { SpriteInfo } from './sprite-info';
import { OniItem, SpriteModifier, Display, Vector2, SpriteTag } from '../../../../../blueprintnotincluded-lib/index'

export class DrawPart
{
  spriteModifier: SpriteModifier;
  spriteInfo: SpriteInfo;
  sprite: PIXI.Sprite;

  private alpha_: number;
  get alpha() { return this.alpha_; }
  set alpha(value: number) { 
    if (this.sprite != null) this.sprite.alpha = value;
    this.alpha_ = value; 
  }
  private tint_: number;
  get tint() { return this.tint_; }
  set tint(value: number) { 
    if (this.sprite != null) this.sprite.tint = value;
    this.tint_ = value; 
  }
  private zIndex_: number;
  get zIndex() { return this.zIndex_; }
  set zIndex(value: number) { 
    if (this.sprite != null) this.sprite.zIndex = value;
    this.zIndex_ = value; 
  }
  private visible_: boolean;
  get visible() { return this.visible_; }
  set visible(value: boolean) { 
    if (this.sprite != null) this.sprite.visible = value;
    this.visible_ = value; 
  }

  isReady: boolean;

  public constructor()
  {
    this.isReady = false;
    this.alpha = 1;
    this.tint = 0xFFFFFF;
  }

  public prepareSprite(container: PIXI.Container, oniItem: OniItem) {

    if (!this.isReady) {
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

        this.sprite.alpha = this.alpha;
        this.sprite.tint = this.tint;
        this.sprite.zIndex = this.zIndex;
        this.sprite.visible = this.visible;


        let tileOffset: Vector2 = new Vector2(
          oniItem.size.x % 2 == 0 ? 50 : 0,
          -50
        );

        // TODO invert translation in export
        this.sprite.x = 0 + (this.spriteModifier.translation.x + tileOffset.x);
        this.sprite.y = 0 - (this.spriteModifier.translation.y + tileOffset.y);

        this.sprite.scale.x = 1;
        this.sprite.scale.y = 1;
        this.sprite.width = this.spriteInfo.realSize.x;
        this.sprite.height = this.spriteInfo.realSize.y;
        this.sprite.scale.x *=  this.spriteModifier.scale.x;
        this.sprite.scale.y *= this.spriteModifier.scale.y;

        // TODO invert rotation in export
        this.sprite.angle = -this.spriteModifier.rotation;

        container.addChild(this.sprite);
        this.isReady = true;
      }
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