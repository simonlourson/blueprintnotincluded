import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { OniItem } from '../../../common/oni-item';
import {SelectItem} from 'primeng/api';
import { TemplateItem } from '../../../common/template/template-item';
import { ComposingElement } from '../../../common/composing-element';
import { Template } from '../../../common/template/template';
import { ToolType } from '../../../common/tools/tool';
import { TileInfo } from '../../../common/tile-info';
import { TemplateItemWire } from '../../../common/template/template-item-wire';
import { Camera } from '../../../common/camera';
import { Vector2 } from '../../../common/vector2';
import { DrawHelpers } from '../../../drawing/draw-helpers';
import { DrawPixi } from '../../../drawing/draw-pixi';
import { BuildMenuCategory, BuildMenuItem } from '../../../common/bexport/b-build-order';
import { ToolService, IObsToolChanged } from 'src/app/module-blueprint/services/tool-service';
import { IObsTemplateItemChanged } from 'src/app/module-blueprint/common/tools/select-tool';
import { IObsBuildItemChanged } from 'src/app/module-blueprint/common/tools/build-tool';



@Component({
  selector: 'app-build-tool',
  templateUrl: './build-tool.component.html',
  styleUrls: ['./build-tool.component.css']
})
export class ComponentSideBuildToolComponent implements OnInit, IObsBuildItemChanged, IObsToolChanged {

  categories: SelectItem[];
  items: SelectItem[];

  // This is used by the accordeon
  activeIndex=0;

  currentCategory: BuildMenuCategory;
  currentItem: OniItem;

  constructor(private toolService: ToolService) 
  {

    this.categories = []
    this.items = [];

    this.toolService.buildTool.subscribeBuildItemChanged(this);
    this.toolService.subscribeToolChanged(this);
  }

  ngOnInit() {
    let allCategories = {label:BuildMenuCategory.allCategories.categoryName, value:BuildMenuCategory.allCategories}
    this.categories.push(allCategories);
    this.currentCategory = BuildMenuCategory.allCategories;
  }

  databaseLoaded: boolean = false;
  oniItemsLoaded()
  {
    for (let buildCategory of BuildMenuCategory.buildMenuCategories)
      this.categories.push({label:buildCategory.categoryName, value:buildCategory});

    this.currentCategory = BuildMenuCategory.allCategories;
    this.currentItem = OniItem.getOniItem('Tile');
    this.changeCategory();

    this.databaseLoaded = true;
  }

  updateItemList()
  {
    this.items = [];

    for (let buildMenuItem of BuildMenuItem.buildMenuItems)
    {
      if (this.currentCategory == BuildMenuCategory.allCategories || this.currentCategory.category == buildMenuItem.category)
      {
        let oniItem = OniItem.getOniItem(buildMenuItem.buildingId);
        this.items.push({label:oniItem.id, value:oniItem});
      }
    }
  }

  changeCategory()
  {
    this.updateItemList();
    if (this.items.length >= 1) this.currentItem = this.items[0].value;
    this.uiItemChanged();
  }

  uiItemChanged()
  {
    this.toolService.buildTool.changeItem(Template.createInstance(this.currentItem.id));
  }

  // IObsBuildItemChanged
  itemChanged(templateItem: TemplateItem) {
    let category = BuildMenuCategory.getCategoryFromItem(templateItem.oniItem);
    if (category != null) {
      this.currentCategory = category;
      this.updateItemList();
      
      this.currentItem = templateItem.oniItem;
    }
  }

  // IObsToolChanged
  toolChanged(toolType: ToolType) {
    // If the build tool was just selected,
    // We simulate a click to recreate the build tool template item
    if (toolType == ToolType.build) this.uiItemChanged();
  }

  setOriginal(templateItem: TemplateItem)
  {
    // TODO in setTemplateItem
    //this.currentCategory = templateItem.oniItem.category;
    this.currentItem = templateItem.oniItem;

    
  }







  











  /************************
  ** Tool interface      **
  ************************/
  toolType = ToolType.build;
  
  setTemplateItem(templateItem: TemplateItem) 
  {
    /*
    // TODO fixme
    if (templateItem != null) this.changeItem_(templateItem.cloneForBuilding());
    else
    {
      this.changeItem();
    }
    */
  }

  leftMouseDown(blueprint: Template, tile: Vector2) 
  {
    //this.build(blueprint);
  }

  leftMouseUp(blueprint: Template, tile: Vector2) 
  {
    // TODO tentative placement, build on leftMouseUp
  }

  changeTileDrag(blueprint: Template, previousTileDrag: Vector2, currentTileDrag: Vector2)
  {
    //console.log("Start drag from " + JSON.stringify(previousTileDrag) + ' to ' + JSON.stringify(currentTileDrag));
    /*
    console.log("********************************");
    console.log("Start drag from " + JSON.stringify(previousTileDrag) + ' to ' + JSON.stringify(currentTileDrag));
    let diffDrag = new Vector2(currentTileDrag.x - previousTileDrag.x, currentTileDrag.y - previousTileDrag.y);
    let diffDragLength = Math.sqrt(diffDrag.x * diffDrag.x + diffDrag.y * diffDrag.y);
    let diffDragUnit = new Vector2(diffDrag.x / diffDragLength, diffDrag.y / diffDragLength);

    let tileDragFloat = Vector2.clone(previousTileDrag);
    let dragOld: Vector2;
    let dragNew: Vector2;
    do
    {
      let tileDragFloatOld = Vector2.clone(tileDragFloat);
      dragOld = new Vector2(Math.floor(tileDragFloat.x), Math.floor(tileDragFloat.y))
      tileDragFloat.x += diffDragUnit.x;
      tileDragFloat.y += diffDragUnit.y;
      dragNew = new Vector2(Math.floor(tileDragFloat.x), Math.floor(tileDragFloat.y))

      this.unitChangeTileDrag(blueprint, dragOld, dragNew);
      console.log(JSON.stringify(tileDragFloatOld) + ' to ' + JSON.stringify(tileDragFloat))
    }
    while (!dragNew.equals(currentTileDrag))

    console.log("Stop drag");
    console.log("********************************");
*/


    this.unitChangeTileDrag(blueprint, previousTileDrag, currentTileDrag);
  }

  unitChangeTileDrag(blueprint: Template, previousTileDrag: Vector2, currentTileDrag: Vector2)
  {
    //this.templateItemToBuild.position = currentTileDrag;
    //this.build(blueprint);

    /*
    if (this.templateItemToBuild.oniItem.isWire)
    {
      let itemsPrevious = blueprint.getTemplateItemsAt(previousTileDrag).filter(i => i.id == this.templateItemToBuild.id);
      let itemsCurrent = blueprint.getTemplateItemsAt(currentTileDrag).filter(i => i.id == this.templateItemToBuild.id);

      if (itemsPrevious != null && itemsPrevious.length > 0 && itemsCurrent != null && itemsCurrent.length > 0)
      {
        let itemPrevious = itemsPrevious[0] as TemplateItemWire;
        let itemCurrent = itemsCurrent[0] as TemplateItemWire;

        //this.connectAToB(itemPrevious, itemCurrent);
        //this.connectAToB(itemCurrent, itemPrevious);
        itemPrevious.prepareSpriteInfoModifier(blueprint);
        itemCurrent.prepareSpriteInfoModifier(blueprint);
      }
      */
    
  }

}

