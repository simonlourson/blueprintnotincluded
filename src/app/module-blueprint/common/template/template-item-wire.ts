import { Vector2 } from "../vector2";
import { OniItem } from "../oni-item";
import { OniBuilding } from "../../oni-import/oni-building";
import { Template } from "./template";
import { TemplateItem } from "./template-item";
import { SpriteModifier } from "../../drawing/sprite-modifier";
import { Camera } from "../camera";
import { SpriteInfo } from "../../drawing/sprite-info";
import { ImageSource } from "../../drawing/image-source";
import { DrawHelpers } from "../../drawing/draw-helpers";
import { TemplateItemCloneable } from "./template-item-cloneable";
import { DrawPixi } from '../../drawing/draw-pixi';

export class TemplateItemWire extends TemplateItem implements TemplateItemCloneable<TemplateItemWire>
{
  static defaultConnections = 0;
  connections: number;

  solidSpriteModifierId: string;
  solidSpriteInfo: SpriteInfo;
  solidSpriteModifier: SpriteModifier;

  constructor(id: string)
  {
    super(id);
  }

  public importOniBuilding(building: OniBuilding)
  {
      super.importOniBuilding(building);
      
      this.connections = building.connections == null ? TemplateItemWire.defaultConnections : building.connections
  }

  public importFromCloud(original: TemplateItem)
  {
    let originalCast = original as TemplateItemWire;
    this.connections = originalCast.connections;
    super.importFromCloud(original);
  }

  public cleanUp()
  {
    if (this.connections == null) this.connections = TemplateItemWire.defaultConnections;
    super.cleanUp();
  }

  public clone(): TemplateItemWire
  {
    let returnValue = new TemplateItemWire(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public cloneForExport(): TemplateItemWire
  {
    let returnValue = new TemplateItemWire(this.id);

    returnValue.copyFromForExport(this);
    returnValue.deleteDefaultForExport()

    return returnValue;
  }

  public cloneForBuilding(): TemplateItemWire
  {
    let returnValue = new TemplateItemWire(this.id);

    returnValue.copyFromForExport(this);
    returnValue.connections = 0;
    returnValue.cleanUp();

    return returnValue;
  }

  /*
  public getDebug4(): string
  {
    let debug:any = {};
    debug.connections = this.connections;
    return JSON.stringify(debug);
  }

  
  public getDebug3(): string
  {
    let debug:any = {};
    debug.realSpriteModifier = this.realSpriteModifier;
    return JSON.stringify(debug);
  }
  */

  public copyFromForExport(original: TemplateItemWire)
  {
    this.connections = original.connections;
    super.copyFromForExport(original);
  }

    public deleteDefaultForExport()
    {
      if (TemplateItemWire.defaultConnections == this.connections) this.connections = undefined;
      super.deleteDefaultForExport();
    }

    public prepareSpriteInfoModifier(blueprint: Template)
    {
        this.realSpriteModifierId = this.oniItem.spriteModifierId + DrawHelpers.connectionString[this.connections];
        this.realSpriteModifier = SpriteModifier.getSpriteModifer(this.realSpriteModifierId);

        // TODO add solid
        this.solidSpriteModifierId = this.oniItem.spriteModifierId + DrawHelpers.connectionStringSolid[this.connections];
        this.solidSpriteModifier = SpriteModifier.getSpriteModifer(this.solidSpriteModifierId);
    }

    solidSprite: PIXI.Sprite;
    public drawPixi(camera: Camera, drawPixi: DrawPixi)
    {
      super.drawPixi(camera, drawPixi);

      this.solidSpriteInfo = SpriteInfo.getSpriteInfo(this.solidSpriteModifier.spriteInfoName);
      
      if (this.solidSprite == null)
      {
        let texture = this.solidSpriteInfo.getTexture();

        if (texture != null) 
        {
          // TODO sprite should change if modifier changes
          // TODO Invert pivoTY in export
          this.solidSprite = PIXI.Sprite.from(texture);
          this.solidSprite.anchor.set(this.solidSpriteInfo.pivot.x, 1-this.solidSpriteInfo.pivot.y);
          this.container.addChild(this.solidSprite);
        }
      }

      if (this.solidSprite != null)
      {
        this.solidSprite.alpha = 0.5;

        // TODO refactor some of this with parent
        this.solidSprite.texture = this.solidSpriteInfo.getTexture();
        this.solidSprite.anchor.set(this.solidSpriteInfo.pivot.x, 1-this.solidSpriteInfo.pivot.y);

        let tileOffset: Vector2 = new Vector2(
          this.oniItem.size.x % 2 == 0 ? 50 : 0,
          -50
        );

        this.solidSprite.x = 0 + (this.solidSpriteModifier.translation.x + tileOffset.x) * camera.currentZoom / 100;
        this.solidSprite.y = 0 - (this.solidSpriteModifier.translation.y + tileOffset.y) * camera.currentZoom / 100;
        
        let sizeCorrected = new Vector2(
          camera.currentZoom / 100 * this.solidSpriteInfo.realSize.x,
          camera.currentZoom / 100 * this.solidSpriteInfo.realSize.y
        );

        this.solidSprite.scale.x = this.solidSpriteModifier.scale.x;
        this.solidSprite.scale.y = this.solidSpriteModifier.scale.y;

        // TODO invert rotation in export
        this.solidSprite.angle = -this.solidSpriteModifier.rotation;
        this.solidSprite.width = sizeCorrected.x;
        this.solidSprite.height = sizeCorrected.y;
      }

      
      
    }
}