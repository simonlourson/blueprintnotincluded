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
import { DrawPart } from '../../drawing/draw-part';

export class TemplateItemWire extends TemplateItem implements TemplateItemCloneable<TemplateItemWire>
{
  static defaultConnections = 0;
  connections: number;
  drawPartSolid: DrawPart;

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
    if (this.drawPart == null)
      this.drawPart = new DrawPart();

    if (this.drawPartSolid == null)
      this.drawPartSolid = new DrawPart();

    this.drawPart.prepareSpriteInfoModifier(this.oniItem.spriteModifierId + DrawHelpers.connectionString[this.connections]);
    this.drawPartSolid.prepareSpriteInfoModifier(this.oniItem.spriteModifierId + DrawHelpers.connectionStringSolid[this.connections]);
  }

  public drawPixi(camera: Camera, drawPixi: DrawPixi)
  {
    super.drawPixi(camera, drawPixi);

    let solidSprite = this.drawPartSolid.getPreparedSprite(camera, drawPixi, this.oniItem);

    if (solidSprite != null)
    {
      if (!this.drawPartSolid.addedToContainer)
      {
        this.container.addChild(solidSprite);
        this.drawPartSolid.addedToContainer = true;
      }

      solidSprite.alpha = 0.5;
    }
  }
}