import { BlueprintService } from '../../services/blueprint-service';
import { BlueprintItem } from '../blueprint/blueprint-item';
import { Vector2 } from '../vector2';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ITool, IChangeTool, ToolType } from './tool';
import { DrawPixi } from '../../drawing/draw-pixi';
import { CameraService } from '../../services/camera-service';
import { ConnectionHelper } from '../utility-connection';
import { IObsBlueprintChange } from '../blueprint/blueprint';
import { DrawHelpers } from '../../drawing/draw-helpers';
import { SameItemCollection } from './same-item-collection';
import { OniItem } from '../oni-item';
import { BuildTool } from './build-tool';
import { BuildableElement } from '../bexport/b-element';

@Injectable()
export class SelectTool implements ITool
{
  public sameItemCollections: SameItemCollection[];

  constructor(private blueprintService: BlueprintService, private cameraService: CameraService) {

    // TODO also do this on blueprint loading
    this.reset();
  }

  get showTool() { 
    return this.sameItemCollections.length > 0;
  }

  reset()
  {
    this.deselectAll();
    this.sameItemCollections = [];
  }

  private lastSelected: BlueprintItem;
  private lastSelectedDate: Date;
  selectFromBox(topLeft: Vector2, bottomRight: Vector2) {
    this.deselectAll();
    this.sameItemCollections = [];

    let tileSelected: Vector2[] = [];
      
    for (let x = topLeft.x; x <= bottomRight.x; x++)
      for (let y = topLeft.y; y >= bottomRight.y; y--)
        tileSelected.push(new Vector2(x, y));
      
    if (tileSelected.length > 0) {

      for (let tile of tileSelected) {
        let itemsInTile = this.blueprintService.blueprint.getBlueprintItemsAt(tile);
        for (let item of itemsInTile) this.addToCollection(item);
      }

      // TODO adjusted zindex here
      this.sameItemCollections = this.sameItemCollections.sort((i1, i2) => { return i2.oniItem.zIndex - i1.oniItem.zIndex; });

      let firstSelected: BlueprintItem = null;
      let selectedOne = false;
      this.sameItemCollections.map((itemCollection) => {
        if (!selectedOne && itemCollection.items != null && itemCollection.items.length > 0 && itemCollection.items[0].isOpaque) {
          selectedOne = true;
          firstSelected = itemCollection.items[0];

          let newDate = new Date();
          if (firstSelected == this.lastSelected && this.lastSelectedDate != null && newDate.getTime() - this.lastSelectedDate.getTime() < 500) this.selectAll(firstSelected.oniItem);
          else {
            itemCollection.selected = true;
            
          }

          this.lastSelected = firstSelected;
          this.lastSelectedDate = newDate;
        }
      });

      if (firstSelected == null) this.currentMultipleSelectionIndex = 0;
    }
  }

  selectAll(oniItem: OniItem) {
    this.deselectAll();

    this.blueprintService.blueprint.blueprintItems.filter((item) => { return item.oniItem == oniItem; }).map((item) => {
      this.addToCollection(item);
    });

    this.currentMultipleSelectionIndex = 0;
  }

  selectEveryElement(buildableElement: BuildableElement) {
    this.deselectAll();

    for (let blueprintItem of this.blueprintService.blueprint.blueprintItems)
      if (blueprintItem.buildableElements.indexOf(buildableElement) != -1)
        this.addToCollection(blueprintItem);

    // TODO this does not seem to sort
    this.sameItemCollections = this.sameItemCollections.sort((i1, i2) => { return i2.oniItem.zIndex - i1.oniItem.zIndex; });

    this.currentMultipleSelectionIndex = 0;
  }

  addToCollection(blueprintItem: BlueprintItem) {

    // Find if there is already an item collection for this oniItem
    let itemCollectionArray = this.sameItemCollections.filter((sameItem) => { return blueprintItem.oniItem.id == sameItem.oniItem.id; });
    if (itemCollectionArray.length == 0) {
      let newItemCollection = new SameItemCollection(blueprintItem.oniItem);
      newItemCollection.addItem(blueprintItem);

      this.sameItemCollections.push(newItemCollection);
    }
    else itemCollectionArray[0].addItem(blueprintItem);
  }

  deselectAll() {
    if (this.sameItemCollections != null) this.sameItemCollections.map((itemCollection) => { itemCollection.selected = false; });
    this.sameItemCollections= [];
  }

  buildingsDestroy(itemCollection: SameItemCollection) {
    
    this.blueprintService.blueprint.pauseChangeEvents();
    for (let item of itemCollection.items)
      this.blueprintService.blueprint.destroyBlueprintItem(item);
    this.blueprintService.blueprint.resumeChangeEvents();

    this.sameItemCollections.splice(this.sameItemCollections.indexOf(itemCollection), 1);
  }

  get currentMultipleSelectionIndex() {
    let activeIndex = -1;

    for (let indexSelected = 0; indexSelected < this.sameItemCollections.length; indexSelected++)
      if (this.sameItemCollections[indexSelected].selected)
        activeIndex = indexSelected;

    return activeIndex;
  }

  set currentMultipleSelectionIndex(value: number) {
    for (let indexSelected = 0; indexSelected < this.sameItemCollections.length; indexSelected++)
      this.sameItemCollections[indexSelected].selected = (value == indexSelected);
  }

  itemGroupeNext() {
    let currentIndex = this.currentMultipleSelectionIndex;

    currentIndex++;
    currentIndex = currentIndex % this.sameItemCollections.length;
    
    this.currentMultipleSelectionIndex = currentIndex;
  }
  
  itemGroupePrevious() {
    let currentIndex = this.currentMultipleSelectionIndex;

    // Special case : if nothing is currently selected, we want the next selection to be 0;
    if (currentIndex == -1) currentIndex = 1;

    currentIndex--;
    if (currentIndex < 0) currentIndex += this.sameItemCollections.length;

    this.currentMultipleSelectionIndex = currentIndex;
  }

  destroyAll() {
    if (this.sameItemCollections != null)
      for (let itemCollection of this.sameItemCollections)
        itemCollection.destroyAll();

    this.deselectAll();
  }

  // Tool interface :
  switchFrom() {
    this.deselectAll();
  }

  switchTo() {
    this.deselectAll();
  }

  mouseOut() {}

  mouseDown(tile: Vector2) {}
  
  leftClick(tile: Vector2) {
    this.selectFromBox(tile, tile);
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

      this.selectFromBox(topLeft, bottomRight);
    }

    this.beginSelection = null;
  }

  keyDown(keyCode: string) {
    if (keyCode == 'Delete') {
      let itemGroupToDestroyIndex = this.currentMultipleSelectionIndex;
      if (itemGroupToDestroyIndex != -1) this.buildingsDestroy(this.sameItemCollections[itemGroupToDestroyIndex]);
    }
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

    drawPixi.drawTileRectangle(camera, topLeft, bottomRight, true, 2, 0x4CFF00, 0x2D9600, 0.25, 0.8);
  }

  toggleable: boolean = false;
  visible: boolean = false;
  captureInput: boolean = true;
  toolType = ToolType.select;
  toolGroup: number = 1;
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