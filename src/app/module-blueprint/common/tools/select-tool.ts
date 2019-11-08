import { BlueprintService } from '../../services/blueprint-service';
import { TemplateItem } from '../template/template-item';
import { Vector2 } from '../vector2';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ITool, IChangeTool } from './tool';
import { DrawPixi } from '../../drawing/draw-pixi';
import { CameraService } from '../../services/camera-service';
import { ConnectionHelper } from '../utility-connection';

@Injectable()
export class SelectTool implements ITool
{
  public headerString;
  public templateItemsToShow: TemplateItem[];

  private observers: IObsTemplateItemChanged[];

  parent: IChangeTool;

  constructor(private blueprintService: BlueprintService, private cameraService: CameraService) {
    
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
      // First, store the item already selected, if any
      let oldSelected = null
      if (this.templateItemsToShow != null && this.templateItemsToShow.filter((item) => {return item.selected;}).length > 0)
        oldSelected = this.templateItemsToShow.filter((item) => item.selected)[0];

      this.deselectAll();
      this.headerString = 'Selected at x:' + tile.x+', y:'+tile.y;
      
      this.templateItemsToShow = this.blueprintService.blueprint.getTemplateItemsAt(tile);

      let newSelected = null
      if (oldSelected != null) {
        
        // Is there an item in the new selected with the same id as the old selected?
        if (this.templateItemsToShow.filter((item) => { return item.oniItem.id == oldSelected.oniItem.id; }).length > 0)
          newSelected = this.templateItemsToShow.filter((item) => { return item.oniItem.id == oldSelected.oniItem.id; })[0];

        // Is there an item in the new selected with the same overlay as the old selected?
        // TODO this might not work
        if (newSelected == null && this.templateItemsToShow.filter((item) => { return item.oniItem.overlay == oldSelected.oniItem.overlay || ConnectionHelper.getOverlayFromLayer(item.oniItem.zIndex) == oldSelected.overlay; }).length > 0)
          newSelected = this.templateItemsToShow.filter((item) => { return item.oniItem.overlay == oldSelected.oniItem.overlay || ConnectionHelper.getOverlayFromLayer(item.oniItem.zIndex) == oldSelected.overlay; })[0];
      }

      this.observers.map((observer) => observer.newSelection() );

      let nbNext = 0;
      if (newSelected != null) nbNext = this.templateItemsToShow.indexOf(newSelected);

      for (let i = 0; i <= nbNext; i++)
        this.observers.map((observer) => observer.nextSelection() );
    }

    this.previousTile = Vector2.clone(tile);
  }

  deselectAll() {
    if (this.templateItemsToShow != null)
      for (let templateItem of this.templateItemsToShow)
        templateItem.selectedSingle = false;
  }

  // Tool interface :
  switchFrom() {
    this.deselectAll();
  }

  switchTo() {
    
  }

  mouseOut() {}
  
  leftClick(tile: Vector2) {
    this.cameraService.resetSinWave();
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

  draw(drawPixi: DrawPixi, camera: CameraService) {

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

    drawPixi.drawTileRectangle(camera, topLeft, bottomRight, true, 2, 0xFF8526, 0x4C270B, 0.25, 0.8);
  }
}

export interface IObsTemplateItemChanged
{
  newSelection();
  nextSelection();
}