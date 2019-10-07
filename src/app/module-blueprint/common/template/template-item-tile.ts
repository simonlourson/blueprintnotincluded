import { Vector2 } from "../vector2";
import { Template } from "./template";
import { TemplateItem } from "./template-item";
import { TemplateItemCloneable } from "./template-item-cloneable";

export class TemplateItemTile extends TemplateItem implements TemplateItemCloneable<TemplateItemTile>
{

  tileConnections: number;

  constructor(id: string)
  {
    super(id);
  }

  public clone(): TemplateItemTile
  {
    let returnValue = new TemplateItemTile(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public cloneForExport(): TemplateItemTile
  {
    let returnValue = new TemplateItemTile(this.id);

    returnValue.copyFromForExport(this);
    returnValue.deleteDefaultForExport()

    return returnValue;
  }

  public cloneForBuilding(): TemplateItemTile
  {
    let returnValue = new TemplateItemTile(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public prepareSpriteInfoModifier(blueprint: Template)
  {
    super.prepareSpriteInfoModifier(blueprint);

    this.updateTileConnections(blueprint);

    this.realSpriteInfoId = this.realSpriteInfoId + "_" + this.tileConnections;
  }

  public updateTileConnections(blueprint: Template)
  {
    this.tileConnections = 0;

    if (blueprint.getTemplateItemsAt(new Vector2(this.position.x + 1, this.position.y)).filter(b => b.id == this.id).length > 0) this.tileConnections += 1;
    if (blueprint.getTemplateItemsAt(new Vector2(this.position.x - 1, this.position.y)).filter(b => b.id == this.id).length > 0) this.tileConnections += 2;
    if (blueprint.getTemplateItemsAt(new Vector2(this.position.x, this.position.y - 1)).filter(b => b.id == this.id).length > 0) this.tileConnections += 4;
    if (blueprint.getTemplateItemsAt(new Vector2(this.position.x, this.position.y + 1)).filter(b => b.id == this.id).length > 0) this.tileConnections += 8;
      
  }
}