import { BlueprintItem } from './blueprint-item';
import { OniItem } from '../oni-item';
import { BlueprintItemWire } from './blueprint-item-wire';
import { BlueprintItemTile } from './blueprint-item-tile';
import { TemplateItemElement } from './template-item-element';

export class BlueprintHelpers
{
  static createInstance(id: string): BlueprintItem
  {
    let newTemplateItem;
    let oniItem = OniItem.getOniItem(id);

    if (oniItem == null) return null;

    if (oniItem.isWire) newTemplateItem = new BlueprintItemWire(id);
    else if (oniItem.isTile) newTemplateItem = new BlueprintItemTile(id);
    else if (oniItem.isElement) newTemplateItem = new TemplateItemElement(id);
    else newTemplateItem = new BlueprintItem(id);
  
    return newTemplateItem;
  }
}