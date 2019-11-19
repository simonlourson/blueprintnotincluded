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
import { ComposingElement } from '../composing-element';
import { BniBlueprint } from './io/bni/bni-blueprint';
import { BinaryReader, Encoding } from 'csharp-binary-stream';
import { BniBuilding } from './io/bni/bni-building';
import { BlueprintHelpers } from './blueprint-helpers';

export class Blueprint
{
  id: string;
  name: string;
  blueprintItems: BlueprintItem[];
  templateTiles: BlueprintItem[][];

  innerYaml: any;

  constructor()
  {
    this.name = 'default';
    this.blueprintItems = [];
    this.distinctElements = [];

    this.obeserversItemDestroyed = [];
  }

  public importOniTemplate(oniTemplate: OniTemplate)
  {
    this.name = oniTemplate.name;
    this.blueprintItems = [];
    

    // Copy the buildings
    for (let building of oniTemplate.buildings)
    {
      let oniItem = OniItem.getOniItem(building.id);

      let newTemplateItem = BlueprintHelpers.createInstance(building.id);
      if (newTemplateItem == null) continue;

      newTemplateItem.importOniBuilding(building);
      
      this.addTemplateItem(newTemplateItem);
    }

    // Copy the cells
    for (let cell of oniTemplate.cells)
    {
      let newTemplateItem = BlueprintHelpers.createInstance(OniItem.elementId);
      if (newTemplateItem == null) continue;
      // TODO add a warning on import

      newTemplateItem.importOniCell(cell);

      let elementAlreadyOnTile: boolean = false;
      for (let t of this.getTemplateItemsAt(newTemplateItem.position))
      {
        if (t.oniItem.isElement)
        {
          elementAlreadyOnTile = true;
          if (t.element != newTemplateItem.element) throw new Error('Two different elements on the same tile');
        }
      }
    }

    // Keep a copy of the yaml object in memory
    this.innerYaml = oniTemplate;
  }

  public importBniBlueprint(bniBlueprint: BniBlueprint)
  {
    this.name = bniBlueprint.friendlyname;

    this.blueprintItems = [];

    for (let building of bniBlueprint.buildings)
    {
      let newTemplateItem = BlueprintHelpers.createInstance(building.buildingdef);
      if (newTemplateItem == null) continue;

      newTemplateItem.importBniBuilding(building);
      
      this.addTemplateItem(newTemplateItem);
    }
  }

  public importFromCloud(original: Blueprint)
  {
    this.name = original.name;
    this.blueprintItems = [];

    for (let originalTemplateItem of original.blueprintItems)
    {
      let newTemplateItem = BlueprintHelpers.createInstance(originalTemplateItem.id);
      if (newTemplateItem == null) continue;

      newTemplateItem.importFromCloud(originalTemplateItem);
      this.addTemplateItem(newTemplateItem);
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

    this.importBniBlueprint(bniBlueprint);

  }

  // TODO should just use the camera service overlay
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

  distinctElements: ComposingElement[];
  public prepareDistinctElements()
  {
    for (let templateItem of this.blueprintItems.filter(t => t.oniItem.isElement))
      if (this.distinctElements.indexOf(templateItem.element) == -1)
        this.distinctElements.push(templateItem.element)
  }

  public addTemplateItem(templateItem: BlueprintItem)
  {
    this.blueprintItems.push(templateItem);
    templateItem.tileIndexes = [];

    for (let x = templateItem.topLeft.x; x <= templateItem.bottomRight.x; x++)
      for (let y = templateItem.topLeft.y; y >= templateItem.bottomRight.y; y--)
      {
        let tilePosition = new Vector2(x, y);
        templateItem.tileIndexes.push(this.getTileIndex(tilePosition));
        this.getTemplateItemsAt(tilePosition).push(templateItem);
      }
  }

  public getTileIndex(position: Vector2): number
  {
    return (position.x + 500) + 1001 * (position.y + 500);;
  }

  public getTemplateItemsAt(position: Vector2): BlueprintItem[]
  {
    if (this.templateTiles == null) this.templateTiles = [];

    let arrayIndex = this.getTileIndex(position);

    let returnValue = this.templateTiles[arrayIndex];
    if (returnValue == null)
    {
      returnValue = [];
      this.templateTiles[arrayIndex] = returnValue;
    }

    return returnValue;
  }

  obeserversItemDestroyed: IObsItemDestroyed[];
  public subscribeItemDestroyed(observer: IObsItemDestroyed) {
    this.obeserversItemDestroyed.push(observer);
  }

  public destroyTemplateItemsAt(position: Vector2): BlueprintItem[]
  {
    if (this.templateTiles == null) this.templateTiles = [];

    let arrayIndex = (position.x + 500) + 1001 * (position.y + 500);

    let returnValue = this.templateTiles[arrayIndex];
    if (returnValue == null)
    {
      returnValue = [];
      this.templateTiles[arrayIndex] = returnValue;
    }

    return returnValue;
  }
    
  public cloneForExport(): Blueprint
  {
    let returnValue = new Blueprint();
    returnValue.name = this.name;
    returnValue.id = undefined;
    returnValue.blueprintItems = [];

    for (let originalTemplateItem of this.blueprintItems) 
      returnValue.blueprintItems.push(originalTemplateItem.cloneForExport());
    

    returnValue.templateTiles = undefined;
    returnValue.innerYaml = undefined;
    returnValue.obeserversItemDestroyed = undefined;

    return returnValue;
  }

  public clone(): Blueprint
  {
    let returnValue = new Blueprint();
    returnValue.name = this.name;
    returnValue.id = undefined;
    returnValue.blueprintItems = [];

    for (let originalTemplateItem of this.blueprintItems) {
      let newItem = BlueprintHelpers.createInstance(originalTemplateItem.id);
      newItem.copyFromForExport(originalTemplateItem);
      newItem.cleanUp();
      newItem.prepareBoundingBox();
      returnValue.addTemplateItem(newItem);
    }

    returnValue.innerYaml = undefined;
    returnValue.obeserversItemDestroyed = undefined;

    return returnValue;
  }


  public destroyTemplateItem(templateItem: BlueprintItem)
  {
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
    this.obeserversItemDestroyed.map((observer) => {observer.itemDestroyed();})
  }

  public destroy()
  {
    if (this.blueprintItems != null) {

      let blueprintItemsCopy: BlueprintItem[] = [];

      for (let b of this.blueprintItems) blueprintItemsCopy.push(b);
      for (let b of blueprintItemsCopy) this.destroyTemplateItem(b);
    }


      
    
  }
}

export interface IObsItemDestroyed {
  itemDestroyed();
}