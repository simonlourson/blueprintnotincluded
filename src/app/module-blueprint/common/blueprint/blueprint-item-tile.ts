import { Vector2 } from "../vector2";
import { Blueprint } from "./blueprint";
import { BlueprintItem } from "./blueprint-item";
import { DrawHelpers } from '../../drawing/draw-helpers';
import { DrawPart } from '../../drawing/draw-part';
import { CameraService } from '../../services/camera-service';

export class BlueprintItemTile extends BlueprintItem
{

  tileConnections: number;

  constructor(id: string)
  {
    super(id);
  }

  prepareSpriteVisibility(camera: CameraService) {
    super.prepareSpriteVisibility(camera);

    let connectionTag = DrawHelpers.connectionTag[this.tileConnections];

    for (let drawPart of this.drawParts)
      drawPart.makeEverythingButThisTagInvisible(connectionTag);
  }

  public updateTileables(blueprint: Blueprint)
  {
    this.tileConnections = 0;

    if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x - 1, this.position.y)).filter(b => b.id == this.id).length > 0) this.tileConnections += 1;
    if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x + 1, this.position.y)).filter(b => b.id == this.id).length > 0) this.tileConnections += 2;
    if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x, this.position.y + 1)).filter(b => b.id == this.id).length > 0) this.tileConnections += 4;
    if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x, this.position.y - 1)).filter(b => b.id == this.id).length > 0) this.tileConnections += 8;
  }

}