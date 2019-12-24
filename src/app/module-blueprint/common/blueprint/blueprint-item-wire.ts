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

  visibleConnection: boolean;

  drawPartSolid_: DrawPart;
  get drawPartSolid() {
    if (this.drawPartSolid_ == null) this.drawPartSolid_ = new DrawPart();
    return this.drawPartSolid_;
  }

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

  public clone(): BlueprintItemWire
  {
    let returnValue = new BlueprintItemWire(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public cloneForExport(): BlueprintItemWire
  {
    let returnValue = new BlueprintItemWire(this.id);

    returnValue.copyFromForExport(this);
    returnValue.deleteDefaultForExport()

    return returnValue;
  }

  public toMdbBuilding(): MdbBuilding {
    let returnValue = super.toMdbBuilding();

    if (this.connections != BlueprintItemWire.defaultConnections) returnValue.connections = this.connections;

    return returnValue;
  }

  public cloneForBuilding(): BlueprintItemWire
  {
    let returnValue = new BlueprintItemWire(this.id);

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

  prepareSpriteVisibility(camera: CameraService) {
    super.prepareSpriteVisibility(camera);

    let connectionTag = DrawHelpers.connectionTag[this.connections];

    for (let drawPart of this.drawParts)
      drawPart.makeEverythingButThisTagInvisible(connectionTag);
  }

  public copyFromForExport(original: BlueprintItemWire)
  {
    this.connections = original.connections;
    super.copyFromForExport(original);
  }

  public deleteDefaultForExport()
  {
    if (BlueprintItemWire.defaultConnections == this.connections) this.connections = undefined;
    super.deleteDefaultForExport();
  }

  public updateTileables(blueprint: Blueprint)
  {
    
    //this.drawPart.prepareSpriteInfoModifier(this.oniItem.spriteGroups.get("solid").getModifierFromTag(DrawHelpers.connectionTag[this.connections]).;
    //this.drawPartSolid.prepareSpriteInfoModifier(this.oniItem.spriteModifierId + DrawHelpers.connectionStringSolid[this.connections]);
  
    /*
    let spriteModifierConnection = this.oniItem.spriteGroups.get("solid").getModifierFromTag(DrawHelpers.connectionTag[this.connections]);
    let indexDrawPart = 0;
    for (let spriteModifier of this.oniItem.spriteGroups.get("solid").spriteModifiers) {
      if (spriteModifier != null) this.testDrawParts[indexDrawPart].prepareSpriteInfoModifier(spriteModifier.spriteModifierId);

      indexDrawPart++;
    }
    */
  }

  public prepareOverlayInfo(currentOverlay: Overlay)
  {
    super.prepareOverlayInfo(currentOverlay);
    

  }


  public connectionChanged() {

  }

  public drawPixi(camera: CameraService, drawPixi: DrawPixi)
  {
    super.drawPixi(camera, drawPixi);


    this.drawPartSolid.selected = this.selected;
    let solidSprite = this.drawPartSolid.getPreparedSprite(camera, this.oniItem);

    if (solidSprite != null)
    {
      /*
      if (!this.drawPartSolid.addedToContainer)
      {
        this.container.addChild(solidSprite);
        this.drawPartSolid.addedToContainer = true;
      }
      */

      solidSprite.zIndex = -1;
    }
  }
}