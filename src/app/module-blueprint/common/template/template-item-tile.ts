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

  public static generateTileSpriteInfo()
  {

/*
        uv_trim_size = 1/32
        Vector2 vector2_1 = new Vector2((float) x, (float) y);
        Vector2 vector2_2 = vector2_1 + new Vector2(1f, 1f);
        Vector2 vector2_3 = new Vector2(atlas_info.uvBox.x, atlas_info.uvBox.w);
        Vector2 vector2_4 = new Vector2(atlas_info.uvBox.z, atlas_info.uvBox.y);
        if ((connection_bits & BlockTileRenderer.Bits.Left) == (BlockTileRenderer.Bits) 0)
          vector2_1.x -= 0.25f;
        else
          vector2_3.x += uv_trim_size.x;
        if ((connection_bits & BlockTileRenderer.Bits.Right) == (BlockTileRenderer.Bits) 0)
          vector2_2.x += 0.25f;
        else
          vector2_4.x -= uv_trim_size.x;
        if ((connection_bits & BlockTileRenderer.Bits.Up) == (BlockTileRenderer.Bits) 0)
          vector2_2.y += 0.25f;
        else
          vector2_4.y -= uv_trim_size.y;
        if ((connection_bits & BlockTileRenderer.Bits.Down) == (BlockTileRenderer.Bits) 0)
          vector2_1.y -= 0.25f;
        else
          vector2_3.y += uv_trim_size.y;
*/

    let rIndex = 0;
    let uIndex = 0;
    let dIndex = 0;
    let l = false;
    let r = false;
    let u = false;
    let d = false;
    let currentUv: Vector2 = new Vector2(0, 0);
    let dP = 0.25;
    let dUv = 1 / 32;
    for (let i = 0; i <= 15; i++)
    {

      console.log(l+';'+r+';'+u+';'+d);
      console.log(currentUv);

      l = !l;

      rIndex = (rIndex + 1) % 8;
      if (rIndex == 0) r = !r;

      uIndex = (uIndex + 1) % 2;
      if (uIndex == 0) u = !u;

      dIndex = (dIndex + 1) % 4;
      if (dIndex == 0) d = !d;

      currentUv.y += 0.2;
      if (currentUv.y == 0.8)
      {
        currentUv.y = 0;
        currentUv.x += 0.2;
      }
    }
  }
}