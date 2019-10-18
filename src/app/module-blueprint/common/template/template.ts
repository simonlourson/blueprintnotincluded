import {OniBuilding} from '../../oni-import/oni-building'
import {OniCell} from '../../oni-import/oni-cell'
import { OniTemplate } from '../../oni-import/oni-template';
import { OniItem } from '../oni-item';
import { Vector2 } from '../vector2';
import { OverlayType } from '../overlay-type';
import { TemplateItem } from './template-item';
import { TemplateItemWire } from "./template-item-wire";
import { TemplateItemTile } from "./template-item-tile";
import { TemplateItemElement } from './template-item-element';
import { ComposingElement } from '../composing-element';

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

  public importFromCloud(original: Template)
  {
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

  private currentOverlay: OverlayType
  public prepareOverlayInfo(currentOverlay: OverlayType)
  {
    this.currentOverlay = currentOverlay;

    this.refreshOverlayInfo();
  }

  public refreshOverlayInfo()
  {
    for (let templateItem of this.templateItems) templateItem.prepareOverlayInfo(this.currentOverlay);

    this.templateItems.sort(function(a, b) { return a.depth - b.depth; })
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

  public destroy()
  {
    if (this.templateItems != null)
      for (let t of this.templateItems) t.destroy();
  }
}