import { Blueprint } from "./blueprint";
import { BlueprintItem } from "./blueprint-item";
import { CameraService } from "../../services/camera-service";
import { DrawHelpers } from "../../drawing/draw-helpers";
import { DrawPixi } from '../../drawing/draw-pixi';
import { BniBuilding, MdbBuilding, OniBuilding } from '../../../../../../blueprintnotincluded-lib/index';

export class BlueprintItemWire extends BlueprintItem 
{
  static defaultConnections = 0;

  private connections_: number;
  public get connections() { return this.connections_; }
  public set connections(value: number) { 
    if (value != this.connections_) this.reloadCamera = true;
    this.connections_ = value;
  }

  constructor(id: string)
  {
    super(id);
  }

  public importOniBuilding(building: OniBuilding)
  {
    this.connections = building.connections;
    super.importOniBuilding(building);
  }

  public importBniBuilding(building: BniBuilding)
  {
    this.connections = building.flags;
    super.importBniBuilding(building);
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

    this.updateDrawPartVisibilityBasedOnConnections();
  }
  
  cameraChanged(camera: CameraService) {
    super.cameraChanged(camera);
    this.updateDrawPartVisibilityBasedOnConnections();
  }

  modulateSelectedTint(camera: CameraService) {
    super.modulateSelectedTint(camera);
    this.updateDrawPartVisibilityBasedOnConnections();
  }

  private updateDrawPartVisibilityBasedOnConnections() {
    if (this.drawParts != null)
      for (let drawPart of this.drawParts)
        drawPart.makeEverythingButThisTagInvisible(DrawHelpers.connectionTag[this.connections]);
  }


  public toMdbBuilding(): MdbBuilding {
    let returnValue = super.toMdbBuilding();

    if (this.connections != BlueprintItemWire.defaultConnections) returnValue.connections = this.connections;

    return returnValue;
  }

  public toBniBuilding(): BniBuilding {
    let returnValue = super.toBniBuilding();

    returnValue.flags = this.connections;

    return returnValue;
  }

  public updateTileables(blueprint: Blueprint)
  {
    super.updateTileables(blueprint);
  }

  public drawPixi(camera: CameraService, drawPixi: DrawPixi)
  {
    super.drawPixi(camera, drawPixi);
  }
}