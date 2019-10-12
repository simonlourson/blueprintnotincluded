import { Vector2 } from "../vector2";
import { OniItem } from "../oni-item";
import { OniBuilding } from "../../oni-import/oni-building";
import { Template } from "./template";
import { TemplateItem } from "./template-item";
import { SpriteModifier } from "../sprite-modifier";
import { Camera } from "../camera";
import { SpriteInfo } from "../../drawing/sprite-info";
import { ImageSource } from "../../drawing/image-source";
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
        this.realSpriteModifierId = this.oniItem.spriteModifierId + TemplateItemWire.connectionString[this.connections];
        this.realSpriteModifier = SpriteModifier.getSpriteModifer(this.realSpriteModifierId);

        // TODO add solid
    }
}