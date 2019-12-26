import { Vector2 } from "../vector2";
import { OniItem } from "../oni-item";
import { OniBuilding } from "./io/oni/oni-building";
import { Blueprint } from "./blueprint";
import { BlueprintItem } from "./blueprint-item";
import { SpriteModifier } from "../../drawing/sprite-modifier";
import { CameraService } from "../../services/camera-service";
import { SpriteInfo } from "../../drawing/sprite-info";
import { ImageSource } from "../../drawing/image-source";
import { DrawHelpers } from "../../drawing/draw-helpers";
import { DrawPixi } from '../../drawing/draw-pixi';
import { DrawPart } from '../../drawing/draw-part';
import { Overlay } from '../overlay-type';
import { BniBuilding } from './io/bni/bni-building';
import { MdbBuilding } from './io/mdb/mdb-building';

export class BlueprintItemWire extends BlueprintItem 
{
  static defaultConnections = 0;
  public connections: number;

  constructor(id: string)
  {
    super(id);
  }

  public importOniBuilding(building: OniBuilding)
  {
      super.importOniBuilding(building);
      
      this.connections = building.connections == null ? BlueprintItemWire.defaultConnections : building.connections
  }

  public importBniBuilding(building: BniBuilding)
  {
      super.importBniBuilding(building);
      
      this.connections = building.flags == null ? BlueprintItemWire.defaultConnections : building.flags
  }

  public importMdbBuilding(original: MdbBuilding)
  {
    this.connections = original.connections; 
    super.importMdbBuilding(original);
  }

  public cleanUp()
  {
    if (this.connections == null) this.connections = BlueprintItemWire.defaultConnections;
    
    super.cleanUp();
  }

  public toMdbBuilding(): MdbBuilding {
    let returnValue = super.toMdbBuilding();

    if (this.connections != BlueprintItemWire.defaultConnections) returnValue.connections = this.connections;

    return returnValue;
  }

  prepareSpriteVisibility(camera: CameraService) {
    super.prepareSpriteVisibility(camera);

    let connectionTag = DrawHelpers.connectionTag[this.connections];

    for (let drawPart of this.drawParts)
      drawPart.makeEverythingButThisTagInvisible(connectionTag);
  }

  public updateTileables(blueprint: Blueprint)
  {
    super.updateTileables(blueprint);
  }

  public prepareOverlayInfo(currentOverlay: Overlay)
  {
    super.prepareOverlayInfo(currentOverlay);
  }

  public drawPixi(camera: CameraService, drawPixi: DrawPixi)
  {
    super.drawPixi(camera, drawPixi);
  }
}