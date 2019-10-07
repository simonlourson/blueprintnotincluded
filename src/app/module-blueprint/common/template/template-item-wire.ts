import { Vector2 } from "../vector2";
import { OniItem } from "../oni-item";
import { OniBuilding } from "../../oni-import/oni-building";
import { Template } from "./template";
import { TemplateItem } from "./template-item";
import { SpriteModifier } from "../sprite-modifier";
import { Camera } from "../camera";
import { SpriteInfo } from "../sprite-info";
import { ImageSource } from "../image-source";
import { DrawHelpers } from "../../drawing/draw-helpers";
import { TemplateItemCloneable } from "./template-item-cloneable";

export class TemplateItemWire extends TemplateItem implements TemplateItemCloneable<TemplateItemWire>
{
  static defaultConnections = 0;
  static connectionString: string[] = [
      'None_place',
      'L_place',
      'R_place',
      'LR_place',
      'U_place',
      'LU_place',
      'RU_place',
      'LRU_place',
      'D_place',
      'LD_place',
      'RD_place',
      'LRD_place',
      'UD_place',
      'LUD_place',
      'RUD_place',
      'LRUD_place'
  ];
  connections: number;

  
  private realSpriteInfoIdSolid: string;
  private realSpriteInfoSolid: SpriteInfo;

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

  
  public getDebug4(): string
  {
    let debug:any = {};
    debug.connections = this.connections;
    return JSON.stringify(debug);
  }

  /*
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
        //super.prepareSpriteInfoModifier(blueprint);

        // TODO fixme
        this.realSpriteModifierId = this.oniItem.spriteModifierId + TemplateItemWire.connectionString[this.connections];

        this.realSpriteModifier = SpriteModifier.getSpriteModifer(this.realSpriteModifierId);
        /*
        if (this.realSpriteModifier.spriteInfoSuffix != null) this.realSpriteInfoId = this.realSpriteInfoId + this.realSpriteModifier.spriteInfoSuffix;
        else this.realSpriteInfoId = this.realSpriteInfoId + '_' + this.connections;
  
        this.realSpriteInfoIdSolid = this.realSpriteInfoId + '_solid';
        this.realSpriteInfoSolid = SpriteInfo.getSpriteInfo(this.realSpriteInfoIdSolid);
        */
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera)
    {
      // TODO drawn solid overlay
        /*
        let image = ImageSource.getImage(this.oniItem.imageId);
        let realSize = this.oniItem.size;
        if (Vector2.Zero.equals(realSize)) realSize = Vector2.One;

        // Draw the solid before the rest, if we are in the correct overlay
        if (this.correctOverlay && image != null && image.width != 0 && this.realSpriteInfoSolid != null)
        {
            DrawHelpers.drawTileComplex(ctx, camera, this.realSpriteInfoSolid, this.realSpriteModifier, this.oniItem.imageId, 
                this.position, this.oniItem.tileOffset, realSize, this.scale, this.rotation, this.alpha, this.backColor);
            }
            */

        super.draw(ctx, camera);
    }
}