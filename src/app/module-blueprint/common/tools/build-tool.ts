import { BlueprintService } from '../../services/blueprint-service';
import { TemplateItem } from '../template/template-item';
import { Vector2 } from '../vector2';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ITool, IChangeTool, ToolType } from './tool';
import { DrawPixi } from '../../drawing/draw-pixi';
import { Camera } from '../camera';
import { TemplateItemWire } from '../template/template-item-wire';
import { Template } from '../template/template';
import { DrawHelpers } from '../../drawing/draw-helpers';

@Injectable()
export class BuildTool implements ITool
{

  templateItemToBuild: TemplateItem;
  private observers: IObsBuildItemChanged[];

  parent: IChangeTool;

  constructor(private blueprintService: BlueprintService) 
  {
    this.observers = [];
  }

  subscribe(observer: IObsBuildItemChanged)
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
    // TODO the canbuild should not need the position
    if (!this.canBuild()) return;

    let newItem = this.templateItemToBuild.clone();
    newItem.prepareBoundingBox();
    newItem.prepareSpriteInfoModifier(this.blueprintService.blueprint);
    this.blueprintService.blueprint.addTemplateItem(newItem);
    this.blueprintService.blueprint.refreshOverlayInfo()
  }

  private connectAToB(a: TemplateItemWire, b: TemplateItemWire)
  {
    let bitMask = 0;
    if (a.position.x == b.position.x + 1 && a.position.y == b.position.y) bitMask = 1;
    else if (a.position.x == b.position.x - 1 && a.position.y == b.position.y) bitMask = 2;
    else if (a.position.x == b.position.x && a.position.y == b.position.y - 1) bitMask = 4;
    else if (a.position.x == b.position.x && a.position.y == b.position.y + 1) bitMask = 8;

    a.connections = a.connections | bitMask;
  }

  changeItem(item: TemplateItem)
  {
    console.log('changeItem');
    console.log(item);
    let oldItem = this.templateItemToBuild;

    this.templateItemToBuild = item;
    // TODO should the position go into cleanup
    this.templateItemToBuild.position = Vector2.Zero;
    this.templateItemToBuild.alpha = 1;
    this.templateItemToBuild.cleanUp();
    // TODO fixme
    this.templateItemToBuild.prepareBoundingBox();
    this.templateItemToBuild.prepareSpriteInfoModifier(this.blueprintService.blueprint);
    this.observers.map((observer) => observer.itemChanged(item) );

    
    // First destroy the existing item as needed
    if (oldItem != null) oldItem.destroy();
  }
  
  // Tool interface :
  switchFrom() {
    this.destroy();
  }

  switchTo() {
    if (this.templateItemToBuild == null) this.templateItemToBuild = Template.createInstance('Tile');
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
  }
  
  dragStop() {
  }

  draw(drawPixi: DrawPixi, camera: Camera) {
    this.templateItemToBuild.drawPixi(camera, drawPixi);
  }
}

export interface IObsBuildItemChanged
{
  itemChanged(templateItem: TemplateItem);
}