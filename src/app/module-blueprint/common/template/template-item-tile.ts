import { Vector2 } from "../vector2";
import { Template } from "./template";
import { TemplateItem } from "./template-item";
import { TemplateItemCloneable } from "./template-item-cloneable";
import { BSourceUv } from '../bexport/b-source-uv';

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

    //this.updateTileConnections(blueprint);

    //this.realSpriteInfoId = this.realSpriteInfoId + "_" + this.tileConnections;
  }

  public updateTileConnections(blueprint: Template)
  {
    this.tileConnections = 0;

    if (blueprint.getTemplateItemsAt(new Vector2(this.position.x + 1, this.position.y)).filter(b => b.id == this.id).length > 0) this.tileConnections += 1;
    if (blueprint.getTemplateItemsAt(new Vector2(this.position.x - 1, this.position.y)).filter(b => b.id == this.id).length > 0) this.tileConnections += 2;
    if (blueprint.getTemplateItemsAt(new Vector2(this.position.x, this.position.y - 1)).filter(b => b.id == this.id).length > 0) this.tileConnections += 4;
    if (blueprint.getTemplateItemsAt(new Vector2(this.position.x, this.position.y + 1)).filter(b => b.id == this.id).length > 0) this.tileConnections += 8;
  }

  public static generateTileSpriteInfo(kanimPrefix: string, textureName: string): BSourceUv[]
  {
    let returnValue: BSourceUv[] = []

    let rIndex = 0;
    let uIndex = 0;
    let dIndex = 0;
    let l = false;
    let r = false;
    let u = false;
    let d = false;

    let motifStart: number = 40;
    let currentUv: Vector2 = new Vector2(motifStart, motifStart);

    let size: number = 128;
    let uvSize: Vector2 = new Vector2(size, size);
    
    let margin: number = 30;
    let motifRepeatedEvery: number = 208;
    let deltaPivot = margin / (2 * size + 2 * margin); // Do the math lol

    for (let i = 0; i <= 15; i++)
    {
      let newSourceUv = new BSourceUv();
      returnValue.push(newSourceUv);
      newSourceUv.name = kanimPrefix + 'place_';
      newSourceUv.textureName = textureName;

      //console.log(l+';'+r+';'+u+';'+d);

      let pivot = new Vector2(0.5, 0.5);
      let uv: Vector2 = Vector2.clone(currentUv);
      let size: Vector2 = Vector2.clone(uvSize);
      
      if (!l && !r && !u && !d) newSourceUv.name = newSourceUv.name + 'None';

      if (l) newSourceUv.name = newSourceUv.name + 'L';
      else {
        uv.x -= margin;
        size.x += margin;
        pivot.x += deltaPivot;
      }
      if (r) newSourceUv.name = newSourceUv.name + 'R';
      else {
        size.x += margin;
        pivot.x -= deltaPivot;
      }
      if (u) newSourceUv.name = newSourceUv.name + 'U';
      else {
        uv.y -= margin;
        size.y += margin;
        pivot.y += deltaPivot;
      }
      if (d) newSourceUv.name = newSourceUv.name + 'D';
      else {
        size.y += margin;
        pivot.y -= deltaPivot;
      }
      
      newSourceUv.uvMin = Vector2.clone(uv);
      newSourceUv.uvSize = Vector2.clone(size);
      newSourceUv.realSize = new Vector2(size.x / 1.28, size.y / 1.28);
      newSourceUv.pivot = Vector2.clone(pivot);

      console.log(newSourceUv);

      /*
      console.log(uv);
      console.log(size);
      console.log(pivot);
      */

      l = !l;

      rIndex = (rIndex + 1) % 8;
      if (rIndex == 0) r = !r;

      uIndex = (uIndex + 1) % 2;
      if (uIndex == 0) u = !u;

      dIndex = (dIndex + 1) % 4;
      if (dIndex == 0) d = !d;

      currentUv.y += motifRepeatedEvery;
      if (currentUv.y == motifStart + 4 * motifRepeatedEvery)
      {
        currentUv.y = motifStart;
        currentUv.x += motifRepeatedEvery;
      }
    }

    return returnValue;
  }
}