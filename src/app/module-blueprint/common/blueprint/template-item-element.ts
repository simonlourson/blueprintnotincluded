import { Vector2 } from "../vector2";
import { Blueprint } from "./blueprint";
import { BlueprintItem } from "./blueprint-item";
import { TemplateItemCloneable } from "./template-item-cloneable";
import { CameraService } from "../../services/camera-service";
import { OniCell } from "./io/oni/oni-cell";
import { OniBuilding } from "./io/oni/oni-building";
import { ZIndex, Overlay } from "../overlay-type";
import { DrawHelpers } from "../../drawing/draw-helpers";

export class TemplateItemElement extends BlueprintItem implements TemplateItemCloneable<TemplateItemElement>
{

  mass: number;

  constructor(id: string)
  {
    super(id);
  }

  importOniBuilding(building: OniBuilding)
  {
    throw new Error('TemplateItemElement.importOniBuilding should never be called')
  }

  public cleanUp()
  {
    if (this.mass == null) this.mass = 0;
    super.cleanUp();
  }

  clone(): TemplateItemElement
  {
    
    let returnValue = new TemplateItemElement(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public cloneForExport(): TemplateItemElement
  {
    let returnValue = new TemplateItemElement(this.id);

    returnValue.copyFromForExport(this);
    returnValue.deleteDefaultForExport()

    return returnValue;
  }

  public cloneForBuilding(): TemplateItemElement
  {
    let returnValue = new TemplateItemElement(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public deleteDefaultForExport()
  {
    if (this.mass == 0) this.mass = undefined;
    super.deleteDefaultForExport();
  }

  public importOniCell(cell: OniCell)
  {
      //console.log('TemplateItemWire.importOniBuilding')
      super.importOniCell(cell);
      
      this.mass = Math.floor(cell.mass);
  }

  public prepareOverlayInfo(currentOverlay: Overlay)
  {
    /*
    if (currentOverlay == ZIndex.Gas) 
    {
      this.correctOverlay = true;
      this.depth = 5;
    }
    else this.correctOverlay = false;
    */
  }

  public draw(ctx: CanvasRenderingContext2D, camera: CameraService)
  {
    //if (this.correctOverlay && this.element.color != null) DrawHelpers.drawFullRectangle(ctx, camera, this.topLeft, this.bottomRight, this.element.color);
  }
}