
import { Vector2 } from "./vector2";
import { TemplateItem } from "./template/template-item";

export class TileInfo
{
    tileCoords: Vector2;
    templateItems: TemplateItem[];

    selected: TemplateItem;

    public get isCurrentSelectionInList()
    {
        for (let templateItem of this.templateItems) if (this.selected == templateItem) return true;
        return false;
    }

    // The indexSelected should only be used here 
    private indexSelected: number;

    changeSelection: boolean;

    constructor()
    {
        this.tileCoords = new Vector2();
        this.templateItems = [];
        this.indexSelected = 0;
    }

    addTemplateItems(newTemplateItems: TemplateItem[])
    {
        // First we empty the array
        this.templateItems.length = 0;

        // We push the items supplied
        for (let newTemplateItem of newTemplateItems) this.templateItems.push(newTemplateItem);
        
        // If the array is still empty, we add a Vacuum templateItem
        if (this.templateItems.length == 0) this.templateItems.push(TemplateItem.vacuumItem);
        
    }

  nextSelection()
  {
    if (!this.isCurrentSelectionInList)  this.indexSelected = 0;
    else
    {
        this.indexSelected++;
        this.indexSelected = this.indexSelected % this.templateItems.length;
    }

    this.selected = this.templateItems[this.indexSelected];
  }

  unselectAll()
  {
    this.indexSelected = -1;
    this.selected = null;
  }
}