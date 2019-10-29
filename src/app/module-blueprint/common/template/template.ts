import {OniBuilding} from '../../oni-import/oni-building'
import {OniCell} from '../../oni-import/oni-cell'
import { OniTemplate } from '../../oni-import/oni-template';
import { OniItem } from '../oni-item';
import { Vector2 } from '../vector2';
import { ZIndex, Overlay } from '../overlay-type';
import { TemplateItem } from './template-item';
import { TemplateItemWire } from "./template-item-wire";
import { TemplateItemTile } from "./template-item-tile";
import { TemplateItemElement } from './template-item-element';
import { ComposingElement } from '../composing-element';
import { BniBlueprint } from '../blueprint-import/bni-blueprint';
import { BinaryReader, Encoding } from 'csharp-binary-stream';
import { BniBuilding } from '../blueprint-import/bni-building';

export class Template
{
  name: string;
  templateItems: TemplateItem[];
  templateTiles: TemplateItem[][];

  innerYaml: any;

  constructor()
  {
    this.name = 'default';
    this.templateItems = [];
    this.distinctElements = [];
  }

  public importOniTemplate(oniTemplate: OniTemplate)
  {
    this.name = oniTemplate.name;
    this.templateItems = [];
    

    // Copy the buildings
    for (let building of oniTemplate.buildings)
    {
      let oniItem = OniItem.getOniItem(building.id);

      let newTemplateItem = Template.createInstance(building.id);

      newTemplateItem.importOniBuilding(building);
      
      this.addTemplateItem(newTemplateItem);
    }

    // Copy the cells
    for (let cell of oniTemplate.cells)
    {
      let newTemplateItem = Template.createInstance(OniItem.elementId);
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

      // TODO not all elements
      //if (!elementAlreadyOnTile) this.addTemplateItem(newTemplateItem);
    }

    // Keep a copy of the yaml object in memory
    this.innerYaml = oniTemplate;
  }

  public importBniBlueprint(bniBlueprint: BniBlueprint)
  {
    this.name = bniBlueprint.friendlyname;

    this.templateItems = [];

    for (let building of bniBlueprint.buildings)
    {
      let newTemplateItem = Template.createInstance(building.buildingdef);

      newTemplateItem.importBniBuilding(building);
      
      this.addTemplateItem(newTemplateItem);
    }
  }

  public importFromCloud(original: Template)
  {
    // TODO trycatch this
    this.name = original.name;
    this.templateItems = [];

    for (let originalTemplateItem of original.templateItems)
    {
      // TODO was this useful?
      //let oniItem = OniItem.getOniItem(originalTemplateItem.id);

      let newTemplateItem = Template.createInstance(originalTemplateItem.id);

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

  static createInstance(id: string): TemplateItem
  {
    let newTemplateItem;
    let oniItem = OniItem.getOniItem(id);
    if (oniItem.isWire) newTemplateItem = new TemplateItemWire(id);
    else if (oniItem.isTile) newTemplateItem = new TemplateItemTile(id);
    else if (oniItem.isElement) newTemplateItem = new TemplateItemElement(id);
    else newTemplateItem = new TemplateItem(id);
  
    return newTemplateItem;
  }

  private currentOverlay: Overlay
  public prepareOverlayInfo(currentOverlay: Overlay)
  {
    this.currentOverlay = currentOverlay;

    this.refreshOverlayInfo();
  }

  public refreshOverlayInfo()
  {
    for (let templateItem of this.templateItems) templateItem.prepareOverlayInfo(this.currentOverlay);

    // TODO pixi handles that now
    //this.templateItems.sort(function(a, b) { return a.depth - b.depth; })
  }

  distinctElements: ComposingElement[];
  public prepareDistinctElements()
  {
    for (let templateItem of this.templateItems.filter(t => t.oniItem.isElement))
      if (this.distinctElements.indexOf(templateItem.element) == -1)
        this.distinctElements.push(templateItem.element)
  }

  public addTemplateItem(templateItem: TemplateItem)
  {
    this.templateItems.push(templateItem);

    for (let x = templateItem.topLeft.x; x <= templateItem.bottomRight.x; x++)
      for (let y = templateItem.topLeft.y; y >= templateItem.bottomRight.y; y--)
        this.getTemplateItemsAt(new Vector2(x, y)).push(templateItem);

  }

  public getTemplateItemsAt(position: Vector2): TemplateItem[]
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

  public destroyTemplateItemsAt(position: Vector2): TemplateItem[]
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
    
  public cloneForExport(): Template
  {
    let returnValue = new Template();
    returnValue.name = this.name;
    returnValue.templateItems = [];

    for (let originalTemplateItem of this.templateItems) returnValue.templateItems.push(originalTemplateItem.cloneForExport());
    

    returnValue.templateTiles = undefined;
    returnValue.innerYaml = undefined;

    return returnValue;
  }

  public destroyTemplateItem(templateItem: TemplateItem)
  {
    const index = this.templateItems.indexOf(templateItem, 0);
    if (index > -1)
    {
      this.templateItems[index].destroy();
      this.templateItems.splice(index, 1);
    }
  }

  public destroy()
  {
    if (this.templateItems != null)
      for (let t of this.templateItems) t.destroy();
  }
}