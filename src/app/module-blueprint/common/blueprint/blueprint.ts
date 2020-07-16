import {OniBuilding} from './io/oni/oni-building'
import {OniCell} from './io/oni/oni-cell'
import { OniTemplate } from './io/oni/oni-template';
import { OniItem } from '../oni-item';
import { Vector2 } from '../vector2';
import { ZIndex, Overlay, Display } from '../overlay-type';
import { BlueprintItem } from './blueprint-item';
import { BlueprintItemWire } from "./blueprint-item-wire";
import { BlueprintItemTile } from "./blueprint-item-tile";
import { BniBlueprint } from './io/bni/bni-blueprint';
import { BinaryReader, Encoding } from 'csharp-binary-stream';
import { BniBuilding } from './io/bni/bni-building';
import { BlueprintHelpers } from './blueprint-helpers';
import { DrawHelpers } from '../../drawing/draw-helpers';
import { ControlContainer } from '@angular/forms';
import { MdbBlueprint } from './io/mdb/mdb-blueprint';
import { BuildableElement } from '../bexport/b-element';
import { BlueprintItemElement } from './blueprint-item-element';

export class Blueprint
{
  blueprintItems: BlueprintItem[];
  templateTiles: BlueprintItem[][];

  innerYaml: any;

  constructor()
  {
    this.blueprintItems = [];

    this.observersBlueprintChanged = [];
  }

  public importFromOni(oniBlueprint: OniTemplate)
  {
    this.blueprintItems = [];
    

    // Copy the buildings
    for (let building of oniBlueprint.buildings)
    {
      let oniItem = OniItem.getOniItem(building.id);

      let newTemplateItem = BlueprintHelpers.createInstance(building.id);
      if (newTemplateItem == null) continue;

      newTemplateItem.importOniBuilding(building);
      
      this.addBlueprintItem(newTemplateItem);
    }

    // Copy the cells
    for (let cell of oniBlueprint.cells) {

      let elementPosition = new Vector2();
      if (cell.location_x != null) elementPosition.x = cell.location_x;
      if (cell.location_y != null) elementPosition.y = cell.location_y;

      let currentElement: BlueprintItemElement;
      let buildingsAtPosition = this.getBlueprintItemsAt(elementPosition);

      
      for (let building of buildingsAtPosition)
        if (building.oniItem.id == 'Element') {
          currentElement = building as BlueprintItemElement;
          currentElement.setElement(cell.element, 0);
        }

      if (currentElement == null) {
        currentElement = new BlueprintItemElement('Element');
        currentElement.position = elementPosition;
        currentElement.temperature = cell.temperature;
        currentElement.mass = cell.mass;
        currentElement.setElement(cell.element, 0);
        currentElement.cleanUp();

        // TODO boolean in export insteal
        if (currentElement.buildableElements[0].hasTag('Liquid') || currentElement.buildableElements[0].hasTag('Gas') || currentElement.buildableElements[0].hasTag('Vacuum'))
          this.addBlueprintItem(currentElement);
      }

    }

    // Keep a copy of the yaml object in memory
    this.innerYaml = oniBlueprint;
  }

  public importFromBni(bniBlueprint: BniBlueprint)
  {
    this.blueprintItems = [];

    for (let building of bniBlueprint.buildings)
    {
      let newTemplateItem = BlueprintHelpers.createInstance(building.buildingdef);
      if (newTemplateItem == null) continue;

      newTemplateItem.importBniBuilding(building);
      
      this.addBlueprintItem(newTemplateItem);
    }
  }

  public importFromMdb(mdbBlueprint: MdbBlueprint)
  {
    this.blueprintItems = [];

    for (let originalTemplateItem of mdbBlueprint.blueprintItems)
    {
      let newTemplateItem = BlueprintHelpers.createInstance(originalTemplateItem.id);
      
      // Don't import buildings we don't recognise
      if (newTemplateItem == null) continue;

      newTemplateItem.importMdbBuilding(originalTemplateItem);
      this.addBlueprintItem(newTemplateItem);
    }
  }

  public importFromBinary(template: ArrayBuffer)
  {
    const reader = new BinaryReader(template);

    let bniBlueprint = new BniBlueprint();
    bniBlueprint.friendlyname = reader.readString(Encoding.Utf8);
    bniBlueprint.buildings = [];

    let buildingCount = reader.readInt();

    for (let buildingIndex = 0; buildingIndex < buildingCount; buildingIndex++) 
    {
      let bniBuilding = new BniBuilding();

      let offsetX = reader.readInt();
      let offsetY = reader.readInt();
      bniBuilding.offset = new Vector2(offsetX, offsetY);

      let buildingDef = reader.readString(Encoding.Utf8);
      bniBuilding.buildingdef = buildingDef;

      let selectedElementCount = reader.readInt();
      for (let elementIndex = 0; elementIndex < selectedElementCount; elementIndex++)
      {
        let tag = reader.readInt();
      }

      let orientation = reader.readInt();
      bniBuilding.orientation = orientation;

      let flags = reader.readInt();
      bniBuilding.flags = flags;

      bniBlueprint.buildings.push(bniBuilding);
    }

    this.importFromBni(bniBlueprint);

  }

  public destroyAndCopyItems(source: Blueprint, emitChanges: boolean = true) {
    this.destroy(emitChanges);

    this.pauseChangeEvents();
    for (let blueprintItem of source.blueprintItems) this.addBlueprintItem(blueprintItem);
    this.resumeChangeEvents(emitChanges);
  }

  private currentOverlay: Overlay
  public prepareOverlayInfo(currentOverlay: Overlay)
  {
    this.currentOverlay = currentOverlay;
    this.refreshOverlayInfo();
  }

  public refreshOverlayInfo()
  {
    //for (let blueprintItem of this.blueprintItems) blueprintItem.overlayChanged(this.currentOverlay);
  }

  public addBlueprintItem(blueprintItem: BlueprintItem)
  {
    this.blueprintItems.push(blueprintItem);

    if (blueprintItem.tileIndexes == null) blueprintItem.prepareBoundingBox();

    for (let tileIndex of blueprintItem.tileIndexes) this.getBlueprintItemsAtIndex(tileIndex).push(blueprintItem);
  
    this.emitItemAdded(blueprintItem);
  }

  public destroyBlueprintItem(templateItem: BlueprintItem)
  {
    // If the item is a wire, we need to disconnect it
    if (templateItem.oniItem.isWire) {
      let templateItemWire = templateItem as BlueprintItemWire;

      let connectionsArray = DrawHelpers.getConnectionArray(templateItemWire.connections);
      for (let i = 0; i < 4; i++) {
        if (connectionsArray[i]) {
          let offsetToModify = DrawHelpers.connectionVectors[i];
          let positionToModify = new Vector2(templateItem.position.x + offsetToModify.x, templateItem.position.y + offsetToModify.y);

          let itemsToModify = this.getBlueprintItemsAt(positionToModify).filter(i => i.oniItem.objectLayer == templateItem.oniItem.objectLayer);
          for (let itemToModify of itemsToModify) {
            let itemToModifyWire = itemToModify as BlueprintItemWire;

            if (itemToModifyWire != null) {
              let connectionsArrayToModify = DrawHelpers.getConnectionArray(itemToModifyWire.connections);
              connectionsArrayToModify[DrawHelpers.connectionBitsOpposite[i]] = false;
              itemToModifyWire.connections = DrawHelpers.getConnection(connectionsArrayToModify);
            }
          }
        }
      }
    }

    // First remove from the tilemap
    if (templateItem.tileIndexes != null && templateItem.tileIndexes.length > 0)
      for (let tileIndex of templateItem.tileIndexes)
      {
        const indexInTileMap = this.templateTiles[tileIndex].indexOf(templateItem, 0);
        if (indexInTileMap > -1) this.templateTiles[tileIndex].splice(indexInTileMap, 1);
      }

    // Then remove from the item list, 
    const index = this.blueprintItems.indexOf(templateItem, 0);
    if (index > -1) this.blueprintItems.splice(index, 1);

    // Then destroy the sprite
    templateItem.destroy();

    // Then fire the events
    this.emitItemDestroyed();
  }

  public getBlueprintItemsAt(position: Vector2): BlueprintItem[]
  {
    let arrayIndex = DrawHelpers.getTileIndex(position);
    return this.getBlueprintItemsAtIndex(arrayIndex);
  }

  public getBlueprintItemsAtIndex(index: number): BlueprintItem[] {
    if (this.templateTiles == null) this.templateTiles = [];

    let returnValue = this.templateTiles[index];
    if (returnValue == null)
    {
      returnValue = [];
      this.templateTiles[index] = returnValue;
    }

    return returnValue;
  }

  // Sometimes we need to pause the events (when lots of changes are happening at once)
  private pauseChangeEvents_: boolean = false;
  public pauseChangeEvents() {
    this.pauseChangeEvents_ = true;
  }
  public resumeChangeEvents(emitChanges: boolean = true) {
    this.pauseChangeEvents_ = false;
    if (emitChanges) this.emitBlueprintChanged();
  }

  observersBlueprintChanged: IObsBlueprintChange[];
  public subscribeBlueprintChanged(observer: IObsBlueprintChange) {
    this.observersBlueprintChanged.push(observer);
  }

  private emitItemDestroyed() {
    if (!this.pauseChangeEvents_) {
      this.observersBlueprintChanged.map((observer) => {observer.itemDestroyed();});
      this.emitBlueprintChanged();
    }
  }

  private emitItemAdded(blueprintItem: BlueprintItem) {
    if (!this.pauseChangeEvents_) {
      this.observersBlueprintChanged.map((observer) => { observer.itemAdded(blueprintItem); });
      this.emitBlueprintChanged();
    }
  }

  public emitBlueprintChanged() {
    if (!this.pauseChangeEvents_) {
      this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(); });

      for (let blueprintItem of this.blueprintItems)
        blueprintItem.updateTileables(this);
    }
  }

  public toMdbBlueprint(): MdbBlueprint
  {
    let returnValue: MdbBlueprint = {
      blueprintItems: []
    }

    for (let originalTemplateItem of this.blueprintItems) 
      returnValue.blueprintItems.push(originalTemplateItem.toMdbBuilding());
    
    return returnValue;
  }

  public toBniBlueprint(friendlyname: string): BniBlueprint
  {
    let returnValue: BniBlueprint = {
      friendlyname: friendlyname,
      buildings: [],
      digcommands: []
    }

    for (let originalTemplateItem of this.blueprintItems)
      if (originalTemplateItem.id != 'Element')
        returnValue.buildings.push(originalTemplateItem.toBniBuilding());
    
    return returnValue;
  }

  public clone(): Blueprint
  {
    let mdb = this.toMdbBlueprint();

    let returnValue = new Blueprint();
    returnValue.importFromMdb(mdb);

    return returnValue;
  }

  public getBoundingBox(): Vector2[] {

    let topLeft = new Vector2(9999, 9999);
    let bottomRight = new Vector2(-9999, -9999);

    this.blueprintItems.map((item) => { 
      item.tileIndexes.map((index) => {
        let position = DrawHelpers.getTilePosition(index);
        if (topLeft.x > position.x) topLeft.x = position.x;
        if (topLeft.y > position.y) topLeft.y = position.y;
        if (bottomRight.x < position.x) bottomRight.x = position.x;
        if (bottomRight.y < position.y) bottomRight.y = position.y;
      });
    });

    return [topLeft, bottomRight];
  }

  public sortChildren() {
    for (let blueprintItem of this.blueprintItems) blueprintItem.sortChildren();
  }

  public destroy(emitChanges: boolean = true)
  {
    if (this.blueprintItems != null) {

      let blueprintItemsCopy: BlueprintItem[] = [];

      for (let b of this.blueprintItems) blueprintItemsCopy.push(b);

      this.pauseChangeEvents();
      for (let b of blueprintItemsCopy) this.destroyBlueprintItem(b);
      this.resumeChangeEvents(emitChanges);
    }
  }
}

export interface IObsBlueprintChange {
  itemDestroyed();
  itemAdded(blueprintItem: BlueprintItem);
  blueprintChanged();
}