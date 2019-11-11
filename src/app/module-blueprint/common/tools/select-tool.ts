import { BlueprintService } from '../../services/blueprint-service';
import { TemplateItem } from '../template/template-item';
import { Vector2 } from '../vector2';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ITool, IChangeTool } from './tool';
import { DrawPixi } from '../../drawing/draw-pixi';
import { CameraService } from '../../services/camera-service';
import { ConnectionHelper } from '../utility-connection';
import { IObsItemDestroyed } from '../template/template';
import { DrawHelpers } from '../../drawing/draw-helpers';
import { SameItemCollection } from './same-item-collection';

@Injectable()
export class SelectTool implements ITool, IObsItemDestroyed
{
  public headerString;
  public selectionType: SelectionType;
  get isSingle() {return this.selectionType == SelectionType.Single;}
  get isMultiple() {return this.selectionType == SelectionType.Multiple;}
  public templateItemsToShow: TemplateItem[];
  public sameItemCollections: SameItemCollection[];

  private observers: IObsTemplateItemChanged[];

  parent: IChangeTool;

  constructor(private blueprintService: BlueprintService, private cameraService: CameraService) {
    
    this.blueprintService.blueprint.subscribeItemDestroyed(this);

    this.observers = [];
    this.selectionType = SelectionType.None;

    // TODO also do this on blueprint loading
    this.reset();
  }

  reset()
  {
    this.templateItemsToShow = [];
    this.sameItemCollections = [];
    this.previousTile = null;
  }

  public subscribe(subscriber: IObsTemplateItemChanged)
  {
    this.observers.push(subscriber);
  }

  itemDestroyed() {
    this.nextSelection();
  }

  previousTile: Vector2;
  public updateSelectionTool(tile: Vector2)
  {
    // Deselect everything if we are coming from a multiple selection
    if (this.selectionType == SelectionType.Multiple) this.deselectAll();

    this.selectionType = SelectionType.Single;

    // If the user clicked on the same tile, just advance the accordeon
    if (tile.equals(this.previousTile)) this.nextSelection();
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

      let nbNext = 0;
      if (newSelected != null) nbNext = this.templateItemsToShow.indexOf(newSelected);

      for (let i = 0; i <= nbNext; i++) {
        this.nextSelection();
      }
    }

    this.previousTile = Vector2.clone(tile);
  }

  nextSelection()
  {
    // First find the current real active index
    let realActiveIndex = -1;
    for (let currentActiveIndex = 0; currentActiveIndex < this.templateItemsToShow.length; currentActiveIndex++)
      if (this.templateItemsToShow[currentActiveIndex].selected)
        realActiveIndex = currentActiveIndex;

    // Then advance it by one and loop back to 0
    realActiveIndex++;
    realActiveIndex = realActiveIndex % this.templateItemsToShow.length;
    
    // Then set selected for each item not accordingly
    for (let currentActiveIndex = 0; currentActiveIndex < this.templateItemsToShow.length; currentActiveIndex++)
      this.templateItemsToShow[currentActiveIndex].selectedSingle = (currentActiveIndex == realActiveIndex);

  }

  deselectAll() {
    if (this.templateItemsToShow != null)
      for (let templateItem of this.templateItemsToShow)
        templateItem.selectedSingle = false;

    if (this.sameItemCollections != null)
      for (let itemCollection of this.sameItemCollections)
        itemCollection.selected = false;
  }

  doMultipleSelect()
  {
    // TODO does not work in reverse
    // TODO bigger buildings only once
    if (this.beginSelection != null && this.endSelection != null)
    {
      let beginTile = DrawHelpers.getIntegerTile(this.beginSelection);
      let endTile = DrawHelpers.getIntegerTile(this.endSelection);

      let topLeft = new Vector2(
        Math.min(beginTile.x, endTile.x),
        Math.max(beginTile.y, endTile.y)
      );
  
      let bottomRight = new Vector2(
        Math.max(beginTile.x, endTile.x),
        Math.min(beginTile.y, endTile.y)
      );

      let tileSelected: Vector2[] = [];
      
      for (let x = topLeft.x; x <= bottomRight.x; x++)
        for (let y = topLeft.y; y >= bottomRight.y; y--)
          tileSelected.push(new Vector2(x, y));
        

      if (tileSelected.length == 1) {
        this.selectionType = SelectionType.Single;
        this.updateSelectionTool(tileSelected[0]);
      }
      else {
        this.deselectAll();
        this.sameItemCollections = [];
        this.selectionType = SelectionType.Multiple;

        for (let tile of tileSelected) {
          let itemsInTile = this.blueprintService.blueprint.getTemplateItemsAt(tile);
          for (let item of itemsInTile) {
            let itemCollectionArray = this.sameItemCollections.filter((sameItem) => { return item.oniItem.id == sameItem.oniItem.id; });
            if (itemCollectionArray.length == 0) {
              let newItemCollection = new SameItemCollection();
              newItemCollection.oniItem = item.oniItem;
              newItemCollection.items.push(item);

              this.sameItemCollections.push(newItemCollection);
            }
            else itemCollectionArray[0].items.push(item);
          }
        }

        if (this.sameItemCollections.length > 0) this.sameItemCollections[0].selected = true;
      }
    }
  }

  itemGroupeNext() {
  }
  
  itemGroupePrevious() {
  }

  destroyAll() {
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
    this.doMultipleSelect();
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

export enum SelectionType {
  Single,
  Multiple,
  None
}