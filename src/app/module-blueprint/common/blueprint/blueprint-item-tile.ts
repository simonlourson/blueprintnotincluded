import { Vector2 } from "../vector2";
import { Blueprint } from "./blueprint";
import { BlueprintItem } from "./blueprint-item";
import { TemplateItemCloneable } from "./template-item-cloneable";
import { DrawHelpers } from '../../drawing/draw-helpers';
import { DrawPart } from '../../drawing/draw-part';

export class BlueprintItemTile extends BlueprintItem implements TemplateItemCloneable<BlueprintItemTile>
{

  tileConnections: number;

  constructor(id: string)
  {
    super(id);
  }

  public clone(): BlueprintItemTile
  {
    let returnValue = new BlueprintItemTile(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public cloneForExport(): BlueprintItemTile
  {
    let returnValue = new BlueprintItemTile(this.id);

    returnValue.copyFromForExport(this);
    returnValue.deleteDefaultForExport()

    return returnValue;
  }

  public cloneForBuilding(): BlueprintItemTile
  {
    let returnValue = new BlueprintItemTile(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public prepareSpriteInfoModifier(blueprint: Blueprint)
  {
    this.updateTileConnections(blueprint);

    this.drawPart.prepareSpriteInfoModifier(this.oniItem.spriteModifierId + DrawHelpers.connectionString[this.tileConnections]);

  }

  public updateTileConnections(blueprint: Blueprint)
  {
    this.tileConnections = 0;

    if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x - 1, this.position.y)).filter(b => b.id == this.id).length > 0) this.tileConnections += 1;
    if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x + 1, this.position.y)).filter(b => b.id == this.id).length > 0) this.tileConnections += 2;
    if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x, this.position.y + 1)).filter(b => b.id == this.id).length > 0) this.tileConnections += 4;
    if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x, this.position.y - 1)).filter(b => b.id == this.id).length > 0) this.tileConnections += 8;
  }

}