import { BlueprintService } from '../../services/blueprint-service';
import { BlueprintItem } from '../blueprint/blueprint-item';
import { CameraService, DrawHelpers, Vector2 } from "../../../../../../blueprintnotincluded-lib/index";
import { Injectable } from '@angular/core';
import { ITool, IChangeTool, ToolType } from './tool';
import { DrawPixi } from '../../drawing/draw-pixi';
import { BlueprintItemWire } from '../blueprint/blueprint-item-wire';
import { BlueprintHelpers } from '../blueprint/blueprint-helpers';

@Injectable()
export class BuildTool implements ITool
{

  templateItemToBuild: BlueprintItem;
  private observers: IObsBuildItemChanged[];
  private cameraService: CameraService

  parent: IChangeTool;

  constructor(private blueprintService: BlueprintService) 
  {
    this.observers = [];
    this.cameraService = CameraService.cameraService
  }

  subscribeBuildItemChanged(observer: IObsBuildItemChanged)
  {
    this.observers.push(observer);
  }

  destroy()
  {
    if (this.templateItemToBuild != null) {
      this.templateItemToBuild.destroy();
      this.templateItemToBuild = null;
    }
  }

  private canBuild(): boolean
  {
    let alreadyPresent = false;
    for (let tileIndex of this.templateItemToBuild.tileIndexes) {
      for (let templateItem of this.blueprintService.blueprint.getBlueprintItemsAtIndex(tileIndex)) 
        if (this.templateItemToBuild.oniItem.isWire && templateItem.oniItem.objectLayer == this.templateItemToBuild.oniItem.objectLayer) 
          alreadyPresent = true;
        else if (templateItem.oniItem.id == this.templateItemToBuild.oniItem.id) 
          alreadyPresent = true;
    }
    return !alreadyPresent;
  }

  build()
  {
    if (!this.canBuild()) return;

    let newItem = BlueprintHelpers.cloneBlueprintItem(this.templateItemToBuild, false, true);

    newItem.prepareBoundingBox();
    newItem.updateTileables(this.blueprintService.blueprint);
    this.blueprintService.blueprint.addBlueprintItem(newItem);
    this.blueprintService.blueprint.refreshOverlayInfo()
  }

  private connectAToB(a: BlueprintItemWire, b: BlueprintItemWire)
  {
    let bitMask = 0;
    if (a.position.x == b.position.x + 1 && a.position.y == b.position.y) bitMask = 1;
    else if (a.position.x == b.position.x - 1 && a.position.y == b.position.y) bitMask = 2;
    else if (a.position.x == b.position.x && a.position.y == b.position.y - 1) bitMask = 4;
    else if (a.position.x == b.position.x && a.position.y == b.position.y + 1) bitMask = 8;

    a.connections = a.connections | bitMask;
  }

  changeItem(item: BlueprintItem)
  {
    if (this.templateItemToBuild != null) this.templateItemToBuild.destroy();

    this.cameraService.setOverlayForItem(item.oniItem);

    this.templateItemToBuild = item;
    this.templateItemToBuild.setInvisible();
    this.templateItemToBuild.alpha = 1;
    this.templateItemToBuild.cleanUp();
    
    this.templateItemToBuild.prepareBoundingBox();
    this.templateItemToBuild.updateTileables(this.blueprintService.blueprint);
    this.observers.map((observer) => observer.itemChanged(item) );
  }

  buildAndConnect(tileStart: Vector2, tileStop: Vector2) {
    this.templateItemToBuild.position = Vector2.clone(tileStop);
    this.templateItemToBuild.prepareBoundingBox();
    this.build();
    
    if (this.templateItemToBuild.oniItem.isWire)
    {
      let itemsPrevious = this.blueprintService.blueprint.getBlueprintItemsAt(tileStart).filter(i => i.oniItem.objectLayer == this.templateItemToBuild.oniItem.objectLayer);
      let itemsCurrent = this.blueprintService.blueprint.getBlueprintItemsAt(tileStop).filter(i => i.oniItem.objectLayer == this.templateItemToBuild.oniItem.objectLayer);

      if (itemsPrevious != null && itemsPrevious.length > 0 && itemsCurrent != null && itemsCurrent.length > 0)
      {
        let itemPrevious = itemsPrevious[0] as BlueprintItemWire;
        let itemCurrent = itemsCurrent[0] as BlueprintItemWire;

        this.connectAToB(itemPrevious, itemCurrent);
        this.connectAToB(itemCurrent, itemPrevious);
        itemPrevious.updateTileables(this.blueprintService.blueprint);
        itemCurrent.updateTileables(this.blueprintService.blueprint);

        this.blueprintService.blueprint.emitBlueprintChanged();
      }
    }
  }
  
  // Tool interface :
  switchFrom() {
    this.templateItemToBuild.destroy();
  }

  switchTo() {
  }

  mouseOut() {
    if (this.templateItemToBuild != null) this.templateItemToBuild.setInvisible();
  }

  leftClick(tile: Vector2)
  {
    this.templateItemToBuild.position = tile;
    this.build();
  }

  rightClick(tile: Vector2) {
    this.parent.changeTool(ToolType.select);
  }

  hover(tile: Vector2) {
    this.templateItemToBuild.position = Vector2.clone(tile);
    this.templateItemToBuild.prepareBoundingBox();
    this.templateItemToBuild.sortChildren();
  }

  drag(tileStart: Vector2, tileStop: Vector2) {
    
    if (tileStart == null || tileStop == null) return;
    
    let tileStartInt = DrawHelpers.getIntegerTile(tileStart);
    let tileStopInt = DrawHelpers.getIntegerTile(tileStop);

    // Only drag if we are changing tiles
    if (!tileStartInt.equals(tileStopInt)) this.dragStepByStep(tileStart, tileStop);
    
  }

  mouseDown(tile: Vector2) {
    this.templateItemToBuild.position = tile;
    this.build();
  }

  dragStepByStep(tileStart: Vector2, tileStop: Vector2) {
    
    

    //console.log('start')
    //console.log(tileStart);
    //console.log(tileStop);

    // This is the unit taxicab vector representing the general direction of movement
    let delta = new Vector2(
      DrawHelpers.getFloorTile(tileStop).x - DrawHelpers.getFloorTile(tileStart).x,
      DrawHelpers.getFloorTile(tileStop).y - DrawHelpers.getFloorTile(tileStart).y
    );

    delta = new Vector2(
      delta.x == 0 ? 0 : 1 * (delta.x / Math.abs(delta.x)),
      delta.y == 0 ? 0 : 1 * (delta.y / Math.abs(delta.y))
    )
    
    // Special cases : if tileStart or tileStop is an integer, we run into problems, so let's change that
    if (tileStart.x == Math.floor(tileStart.x)) tileStart.x -= delta.x * 0.005;
    if (tileStop.x == Math.floor(tileStop.x)) tileStop.x += delta.x * 0.005;
    if (tileStart.y == Math.floor(tileStart.y)) tileStart.y -= delta.y * 0.005;
    if (tileStop.y == Math.floor(tileStop.y)) tileStop.y += delta.y * 0.005;

    // Current tile is the float tile that will 
    let currentTile = Vector2.clone(tileStart);

    //console.log('delta');
    //console.log(delta);

    // We will either stop advancing when we reach the goal, or when too many loops are through
    let advance = true;
    let i = 0;
    
    // The algorithm requires floor for both x and y
    // However for blueprint, it's floor(x) and ceil(y)
    let startTile = DrawHelpers.getIntegerTile(tileStart);
    //console.log(startTile);

    while (advance) {
      //console.log(DrawHelpers.getIntegerTile(currentTile));

      //console.log('currentTile before');
      //console.log(currentTile);

      // nextTile is currentTile advanced by delta
      // and then floored of ceilingedto be closest to currentTile
      let nextTile = new Vector2(currentTile.x + delta.x, currentTile.y + delta.y);
      if (delta.x > 0) nextTile.x = Math.floor(nextTile.x);
      else if (delta.x < 0) nextTile.x = Math.ceil(nextTile.x);
      if (delta.y > 0) nextTile.y = Math.floor(nextTile.y);
      else if (delta.y < 0) nextTile.y = Math.ceil(nextTile.y);

      
      //console.log('nextTile');
      //console.log(nextTile);

      // d is the distance vector between the final target and currentTile
      let d = new Vector2(
        tileStop.x - currentTile.x,
        tileStop.y - currentTile.y
      );

      // dp is the distance between the next Target and current Tile
      let dp = new Vector2(
        nextTile.x - currentTile.x,
        nextTile.y - currentTile.y
      );

      let dLengthSquared = d.lengthSquared;

      //console.log('d')
      //console.log(d);
      //console.log('dp')
      //console.log(dp)

      let distX: number = 999;
      if (delta.x != 0) distX = (new Vector2(dp.x, d.y * (dp.x / d.x))).lengthSquared;

      let distY: number = 999;
      if (delta.y != 0) distY = (new Vector2(d.x * (dp.y / d.y), dp.y)).lengthSquared;

      //console.log('dist')
      //console.log(new Vector2(distX, distY))

      let newTile: Vector2;
      if (Math.abs(distX - distY) < 0.0000005 && distX < dLengthSquared) {
        //console.log('build');
        //console.log('equal')

        newTile = new Vector2(startTile.x + delta.x, startTile.y);
        this.buildAndConnect(startTile, newTile);
        startTile.x += delta.x;
        //console.log(startTile);

        newTile = new Vector2(startTile.x, startTile.y + delta.y);
        this.buildAndConnect(startTile, newTile);
        startTile.y += delta.y;
        //console.log(startTile);
        
        currentTile.x += dp.x;
        currentTile.y += d.y * (dp.x / d.x);
      }
      else if (distX <= distY && distX < dLengthSquared) {
        //console.log('build');
        currentTile.x += dp.x;
        currentTile.y += d.y * (dp.x / d.x);

        newTile = new Vector2(startTile.x + delta.x, startTile.y);
        this.buildAndConnect(startTile, newTile);
        startTile.x += delta.x;
        //console.log(startTile);
      }
      else if (distY < distX && distY < dLengthSquared) {
        //console.log('build');
        currentTile.x += d.x * (dp.y / d.y);
        currentTile.y += dp.y;

        newTile = new Vector2(startTile.x, startTile.y + delta.y);
        this.buildAndConnect(startTile, newTile);
        startTile.y += delta.y;
        //console.log(startTile);
      }
      else {
        //console.log('stop')
        advance = false;
      } 

      i++;
      if (i > 999) throw new Error("The tile dragger was too long");
      
    }
    
  }
  
  dragStop() {
  }

  keyDown(keyCode: string) {
    if (keyCode == 'o') {
      if (this.templateItemToBuild != null) this.templateItemToBuild.nextOrientation();
    }
  }

  draw(drawPixi: DrawPixi, camera: CameraService) {

    // TODO SOLID
    //if (this.canBuild()) this.templateItemToBuild.drawPart.tint = DrawHelpers.whiteColor;
    //else this.templateItemToBuild.drawPart.tint = 0xD40000;

    this.templateItemToBuild.drawPixi(camera, drawPixi);
    // TODO correct red and alpha when building outside of overlay 
  }

  toggleable: boolean = false;
  visible: boolean = false;
  captureInput: boolean = true;
  toolType = ToolType.build;
  toolGroup: number = 1;
}

export interface IObsBuildItemChanged
{
  itemChanged(templateItem: BlueprintItem);
}