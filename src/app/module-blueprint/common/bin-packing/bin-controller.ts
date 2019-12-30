import { BinTray } from './bin-tray';
import { Vector2 } from '../vector2';
import { BinItem } from './bin-line';

// This is used to repack all the textures into power of two spritesheets, so we can get mipmaps
export class BinController {

  binSize: Vector2;
  binTrays: BinTray[];

  constructor(binSize: Vector2) {
    this.binSize = binSize;
    this.binTrays = [];
  }

  addItem(id: string, size:Vector2, bleed: Vector2): BinItem {
    
    //console.log('Trying to add this item :')
    //console.log({id: id, size: size, bleed: bleed});

    let itemAdded: BinItem = null;

    let trayIndex: number;

    // If we know the item won't fit, we create a custom size tray
    if (size.x + 2 * bleed.x > this.binSize.x || size.y + 2 * bleed.y > this.binSize.y) {
      trayIndex = this.binTrays.length;
      //console.log(`Creating a new tray with index ${trayIndex}`);
      let newBin = new BinTray(new Vector2(size.x + 2 * bleed.x, size.y + 2 * bleed.y), trayIndex);
      this.binTrays.push(newBin);
      itemAdded = newBin.tryAddItem(id, size, bleed);
      if (itemAdded != null) return itemAdded;
    }

    // We try to add the item to the existing bins
    for (trayIndex = 0; trayIndex < this.binTrays.length; trayIndex++) {
      itemAdded = this.binTrays[trayIndex].tryAddItem(id, size, bleed);
      if (itemAdded != null) return itemAdded;
    }

    // If the item was not added, we create a new bin
    //console.log(`Creating a new tray with index ${trayIndex}`);
    let newBin = new BinTray(this.binSize, trayIndex);
    this.binTrays.push(newBin);
    itemAdded = newBin.tryAddItem(id, size, bleed);
    if (itemAdded != null) return itemAdded;
    
    // If the item was still not added, log it and move on
    console.log('This should never happen');
    return itemAdded;
  }
}