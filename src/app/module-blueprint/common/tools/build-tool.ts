import { BlueprintService } from '../../services/blueprint-service';
import { BlueprintItem } from '../blueprint/blueprint-item';
import { Vector2 } from '../vector2';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ITool, IChangeTool, ToolType } from './tool';
import { DrawPixi } from '../../drawing/draw-pixi';
import { CameraService } from '../../services/camera-service';
import { BlueprintItemWire } from '../blueprint/blueprint-item-wire';
import { Blueprint } from '../blueprint/blueprint';
import { DrawHelpers } from '../../drawing/draw-helpers';

@Injectable()
export class BuildTool implements ITool
{

  templateItemToBuild: BlueprintItem;
  private observers: IObsBuildItemChanged[];

  parent: IChangeTool;

  constructor(private blueprintService: BlueprintService, private cameraService: CameraService) 
  {
    this.observers = [];
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
    // TODO we should loop the tiles of the templateItemToBuild according to it's bounding box
    let alreadyPresent = false;
    for (let templateItem of this.blueprintService.blueprint.getTemplateItemsAt(this.templateItemToBuild.position)) 
      if (templateItem.id == this.templateItemToBuild.id) 
        alreadyPresent = true;

    return !alreadyPresent;
  }

  build()
  {
    if (!this.canBuild()) return;

    let newItem = this.templateItemToBuild.clone();
    newItem.prepareBoundingBox();
    newItem.prepareSpriteInfoModifier(this.blueprintService.blueprint);
    this.blueprintService.blueprint.addTemplateItem(newItem);
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
    this.templateItemToBuild.prepareSpriteInfoModifier(this.blueprintService.blueprint);
    this.observers.map((observer) => observer.itemChanged(item) );
  }

  buildAndConnect(tileStart: Vector2, tileStop: Vector2) {
    this.templateItemToBuild.position = Vector2.clone(tileStop);
    this.build();
    
    if (this.templateItemToBuild.oniItem.isWire)
    {
      let itemsPrevious = this.blueprintService.blueprint.getTemplateItemsAt(tileStart).filter(i => i.id == this.templateItemToBuild.id);
      let itemsCurrent = this.blueprintService.blueprint.getTemplateItemsAt(tileStop).filter(i => i.id == this.templateItemToBuild.id);

      if (itemsPrevious != null && itemsPrevious.length > 0 && itemsCurrent != null && itemsCurrent.length > 0)
      {
        let itemPrevious = itemsPrevious[0] as BlueprintItemWire;
        let itemCurrent = itemsCurrent[0] as BlueprintItemWire;

        this.connectAToB(itemPrevious, itemCurrent);
        this.connectAToB(itemCurrent, itemPrevious);
        itemPrevious.prepareSpriteInfoModifier(this.blueprintService.blueprint);
        itemCurrent.prepareSpriteInfoModifier(this.blueprintService.blueprint);
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
    this.templateItemToBuild.prepareSpriteInfoModifier(this.blueprintService.blueprint);

    if (this.canBuild()) this.templateItemToBuild.drawPart.tint = DrawHelpers.whiteColor;
    else this.templateItemToBuild.drawPart.tint = 0xD40000;
  }

  drag(tileStart: Vector2, tileStop: Vector2) {
    
    if (tileStart == null || tileStop == null) return;
    
    let tileStartInt = DrawHelpers.getIntegerTile(tileStart);
    let tileStopInt = DrawHelpers.getIntegerTile(tileStop);

    if (!tileStartInt.equals(tileStopInt)) {

      this.logStepByStep(tileStart, tileStop);
      //this.buildAndConnect(tileStartInt, tileStopInt);
      //BuildTool.logStepByStep(tileStartInt, tileStopInt);
    }
  }

  logStepByStep(tileStart: Vector2, tileStop: Vector2) {
    let currentTile = Vector2.clone(tileStart);

    let testDelta = new Vector2(
      DrawHelpers.getFloorTile(tileStop).x - DrawHelpers.getFloorTile(tileStart).x,
      DrawHelpers.getFloorTile(tileStop).y - DrawHelpers.getFloorTile(tileStart).y
    );

    testDelta = new Vector2(
      testDelta.x == 0 ? 0 : (testDelta.x / Math.abs(testDelta.x)),
      testDelta.y == 0 ? 0 : (testDelta.y / Math.abs(testDelta.y))
    )

    let continueAlg = true;
    let i = 0;
    
    let startTile = DrawHelpers.getFloorTile(tileStart);
    console.log(startTile);

    while (continueAlg) {
      //console.log(DrawHelpers.getIntegerTile(currentTile));

      //console.log('currentTile before');
      //console.log(DrawHelpers.getFloorTile(currentTile));

      let nextTile = new Vector2(
        DrawHelpers.getFloorTile(currentTile).x + testDelta.x,
        DrawHelpers.getFloorTile(currentTile).y + testDelta.y
      );

      //console.log('nextTile');
      //console.log(nextTile);

      let d = new Vector2(
        tileStop.x - currentTile.x,
        tileStop.y - currentTile.y
      );
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
      if (testDelta.x != 0) distX = (new Vector2(dp.x, d.y * (dp.x / d.x))).lengthSquared;

      let distY: number = 999;
      if (testDelta.y != 0) distY = (new Vector2(d.x * (dp.y / d.y), dp.y)).lengthSquared;

      //console.log('dist')
      //console.log(new Vector2(distX, distY))

      let newTile: Vector2;
      if (Math.abs(distX - distY) < 0.0000005 && distX < dLengthSquared) {
        
        //console.log('equal')

        newTile = new Vector2(startTile.x + testDelta.x, startTile.y);
        this.buildAndConnect(startTile, newTile);
        startTile.x += testDelta.x;
        console.log(startTile);

        newTile = new Vector2(startTile.x, startTile.y + testDelta.y);
        this.buildAndConnect(startTile, newTile);
        startTile.y += testDelta.y;
        console.log(startTile);
        
        currentTile.x += dp.x;
        // TODO dp.y here, shoul be the same
        currentTile.y += d.y * (dp.x / d.x);
      }
      else if (distX <= distY && distX < dLengthSquared) {
        currentTile.x += dp.x;
        currentTile.y += d.y * (dp.x / d.x);

        newTile = new Vector2(startTile.x + testDelta.x, startTile.y);
        this.buildAndConnect(startTile, newTile);
        startTile.x += testDelta.x;
        console.log(startTile);
      }
      else if (distY < distX && distY < dLengthSquared) {
        currentTile.x += d.x * (dp.y / d.y);
        currentTile.y += dp.y;

        newTile = new Vector2(startTile.x, startTile.y + testDelta.y);
        this.buildAndConnect(startTile, newTile);
        startTile.y += testDelta.y;
        console.log(startTile);
      }
      else {
        console.log('stop')
        continueAlg = false;
      } 

      if (continueAlg) {
        //console.log(currentTile);
        //console.log(DrawHelpers.getIntegerTile(currentTile));
      }
      //console.log('currentTile after');
      //console.log(currentTile);
      

      i++;
      if (i > 10) continueAlg = false;
    }
    
  }
  
  dragStop() {
  }

  draw(drawPixi: DrawPixi, camera: CameraService) {
    this.templateItemToBuild.drawPixi(camera, drawPixi);
    // TODO utility behind object
  }
}

export interface IObsBuildItemChanged
{
  itemChanged(templateItem: BlueprintItem);
}