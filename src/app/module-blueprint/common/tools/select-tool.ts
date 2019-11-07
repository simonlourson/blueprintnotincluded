import { BlueprintService } from '../../services/blueprint-service';
import { TemplateItem } from '../template/template-item';
import { Vector2 } from '../vector2';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ITool, IChangeTool } from './tool';
import { DrawPixi } from '../../drawing/draw-pixi';
import { Camera } from '../camera';

@Injectable()
export class SelectTool implements ITool
{
  public itemsChanged: Observable<number>;
  public headerString;
  public templateItemsToShow: TemplateItem[];

  private observers: IObsTemplateItemChanged[];

  parent: IChangeTool;

  constructor(private blueprintService: BlueprintService) {
    
    this.itemsChanged = new Observable<number>();
    this.observers = [];

    // TODO also do this on blueprint loading
    this.reset();
  }

  reset()
  {
    this.templateItemsToShow = [];
    this.previousTile = null;
  }

  public subscribe(subscriber: IObsTemplateItemChanged)
  {
    this.observers.push(subscriber);
  }

  previousTile: Vector2;
  public updateSelectionTool(tile: Vector2)
  {
    // If the user clicked on the same tile, just advance the accordeon
    if (tile.equals(this.previousTile)) this.observers.map((observer) => observer.nextSelection() );
    else
    {
      this.deselectAll();
      this.headerString = 'Selected at x:' + tile.x+', y:'+tile.y;
      this.templateItemsToShow = this.blueprintService.blueprint.getTemplateItemsAt(tile);
      this.observers.map((observer) => observer.newSelection() );
      this.observers.map((observer) => observer.nextSelection() );
    }

    this.previousTile = Vector2.clone(tile);
  }

  deselectAll() {
    if (this.templateItemsToShow != null)
      for (let templateItem of this.templateItemsToShow)
        templateItem.selected = false;
  }

  // Tool interface :
  switchFrom() {
    this.deselectAll();
  }

  switchTo() {
    
  }

  mouseOut() {}
  
  leftClick(tile: Vector2) {
    this.updateSelectionTool(tile);
  }

  rightClick(tile: Vector2) {
  }

  hover(tile: Vector2) {
  }

  beginSelection: Vector2 = null;
  endSelection: Vector2;
  drag(tileStart: Vector2, tileStop: Vector2) {
    if (this.beginSelection == null) this.beginSelection = Vector2.clone(tileStart);
    this.endSelection = Vector2.clone(tileStop);
  }

  dragStop() {
    this.beginSelection = null;
  }

  draw(drawPixi: DrawPixi, camera: Camera) {

    // Return
    if (this.beginSelection == null) return;

    let topLeft = new Vector2(
      Math.min(this.beginSelection.x, this.endSelection.x),
      Math.max(this.beginSelection.y, this.endSelection.y)
    );

    let bottomRight = new Vector2(
      Math.max(this.beginSelection.x, this.endSelection.x),
      Math.min(this.beginSelection.y, this.endSelection.y)
    );

    drawPixi.drawTileRectangle(camera, topLeft, bottomRight, true, 2, 0xFFFFFF, 0X000000, 0.5, 0.5);
  }
}

export interface IObsTemplateItemChanged
{
  newSelection();
  nextSelection();
}