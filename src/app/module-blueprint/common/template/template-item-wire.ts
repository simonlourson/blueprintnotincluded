import { Vector2 } from "../vector2";
import { OniItem } from "../oni-item";
import { OniBuilding } from "../../oni-import/oni-building";
import { Template } from "./template";
import { TemplateItem } from "./template-item";
import { SpriteModifier } from "../../drawing/sprite-modifier";
import { CameraService } from "../../services/camera-service";
import { SpriteInfo } from "../../drawing/sprite-info";
import { ImageSource } from "../../drawing/image-source";
import { DrawHelpers } from "../../drawing/draw-helpers";
import { TemplateItemCloneable } from "./template-item-cloneable";
import { DrawPixi } from '../../drawing/draw-pixi';
import { DrawPart } from '../../drawing/draw-part';
import { Overlay } from '../overlay-type';
import { BniBuilding } from '../blueprint-import/bni-building';

export class TemplateItemWire extends TemplateItem implements TemplateItemCloneable<TemplateItemWire>
{
  static defaultConnections = 0;
  connections: number;

  drawPartSolid_: DrawPart;
  get drawPartSolid() {
    if (this.drawPartSolid_ == null) this.drawPartSolid_ = new DrawPart();
    return this.drawPartSolid_;
  }

  constructor(id: string)
  {
    super(id);
  }

  public importOniBuilding(building: OniBuilding)
  {
      super.importOniBuilding(building);
      
      this.connections = building.connections == null ? TemplateItemWire.defaultConnections : building.connections
  }

  public importBniBuilding(building: BniBuilding)
  {
      super.importBniBuilding(building);
      
      this.connections = building.flags == null ? TemplateItemWire.defaultConnections : building.flags
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
    this.drawPart.prepareSpriteInfoModifier(this.oniItem.spriteModifierId + DrawHelpers.connectionString[this.connections]);
    this.drawPartSolid.prepareSpriteInfoModifier(this.oniItem.spriteModifierId + DrawHelpers.connectionStringSolid[this.connections]);
  }

  public prepareOverlayInfo(currentOverlay: Overlay)
  {
    super.prepareOverlayInfo(currentOverlay);
    

    if (this.correctOverlay)
    {
      this.drawPart.tint = this.oniItem.frontColor;
      this.drawPartSolid.tint = this.oniItem.backColor;
      
      this.drawPartSolid.alpha = 1;
    }
    else
    {
      this.drawPart.tint = 0xFFFFFF;
      this.drawPartSolid.alpha = 0;
    }
  }

  public drawPixi(camera: CameraService, drawPixi: DrawPixi)
  {
    super.drawPixi(camera, drawPixi);

    this.drawPartSolid.selected = this.selected;
    let solidSprite = this.drawPartSolid.getPreparedSprite(camera, drawPixi, this.oniItem);

    if (solidSprite != null)
    {
      if (!this.drawPartSolid.addedToContainer)
      {
        this.container.addChild(solidSprite);
        this.drawPartSolid.addedToContainer = true;
      }

      solidSprite.zIndex = -1;
      if (this.correctOverlay) solidSprite.alpha = 1;
      else solidSprite.alpha = 0;
    }
  }
}