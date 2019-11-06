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
      this.headerString = 'Selected at x:' + tile.x+', y:'+tile.y;
      this.templateItemsToShow = this.blueprintService.blueprint.getTemplateItemsAt(tile);
      this.observers.map((observer) => observer.newSelection() );
    }

    this.previousTile = Vector2.clone(tile);
  }

  // Tool interface :
  switchFrom() {

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

  drag(tileStart: Vector2, tileStop: Vector2) {
  }

  dragStop() {
  }

  draw(drawPixi: DrawPixi, camera: Camera) {
    
  }
}

export interface IObsTemplateItemChanged
{
  newSelection();
  nextSelection();
}