import {OniBuilding} from './io/oni/oni-building'
import {OniCell} from './io/oni/oni-cell'
import { OniTemplate } from './io/oni/oni-template';
import { OniItem } from '../oni-item';
import { Vector2 } from '../vector2';
import { ZIndex, Overlay } from '../overlay-type';
import { BlueprintItem } from './blueprint-item';
import { BlueprintItemWire } from "./blueprint-item-wire";
import { BlueprintItemTile } from "./blueprint-item-tile";
import { TemplateItemElement } from './template-item-element';
import { BniBlueprint } from './io/bni/bni-blueprint';
import { BinaryReader, Encoding } from 'csharp-binary-stream';
import { BniBuilding } from './io/bni/bni-building';
import { BlueprintHelpers } from './blueprint-helpers';
import { DrawHelpers } from '../../drawing/draw-helpers';
import { ControlContainer } from '@angular/forms';
import { MdbBlueprint } from './io/mdb/mdb-blueprint';

export class Blueprint
{
  blueprintItems: BlueprintItem[];
  templateTiles: BlueprintItem[][];

  innerYaml: any;

  constructor()
  {
    this.blueprintItems = [];

    this.observersItemDestroyed = [];
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
    for (let cell of oniBlueprint.cells)
    {
      let newTemplateItem = BlueprintHelpers.createInstance(OniItem.elementId);
      if (newTemplateItem == null) continue;
      // TODO add a warning on import

      newTemplateItem.importOniCell(cell);

      let elementAlreadyOnTile: boolean = false;
      for (let t of this.getBlueprintItemsAt(newTemplateItem.position))
      {
        if (t.oniItem.isElement)
        {
          elementAlreadyOnTile = true;
          //if (t.element != newTemplateItem.element) throw new Error('Two different elements on the same tile');
        }
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

  public destroyAndCopyItems(source: Blueprint) {
    this.destroy();

    for (let blueprintItem of source.blueprintItems) this.addBlueprintItem(blueprintItem);
  }

  private currentOverlay: Overlay
  public prepareOverlayInfo(currentOverlay: Overlay)
  {
    this.currentOverlay = currentOverlay;
    this.refreshOverlayInfo();
  }

  public refreshOverlayInfo()
  {
    for (let templateItem of this.blueprintItems) templateItem.prepareOverlayInfo(this.currentOverlay);
  }

  public addBlueprintItem(templateItem: BlueprintItem)
  {
    this.blueprintItems.push(templateItem);

    if (templateItem.tileIndexes == null) templateItem.prepareBoundingBox();

    for (let tileIndex of templateItem.tileIndexes) this.getBlueprintItemsAtIndex(tileIndex).push(templateItem);
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

    // Then fire the event
    this.observersItemDestroyed.map((observer) => {observer.itemDestroyed();})
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

  // TODO is this really useful
  observersItemDestroyed: IObsItemDestroyed[];
  public subscribeItemDestroyed(observer: IObsItemDestroyed) {
    this.observersItemDestroyed.push(observer);
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

  public destroy()
  {
    if (this.blueprintItems != null) {

      let blueprintItemsCopy: BlueprintItem[] = [];

      for (let b of this.blueprintItems) blueprintItemsCopy.push(b);
      for (let b of blueprintItemsCopy) this.destroyBlueprintItem(b);
    }
  }
}

export interface IObsItemDestroyed {
  itemDestroyed();
}