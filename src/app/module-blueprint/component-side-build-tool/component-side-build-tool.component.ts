import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { OniItem } from '../common/oni-item';
import {SelectItem} from 'primeng/api';
import { TemplateItem } from '../common/template/template-item';
import { ComposingElement } from '../common/composing-element';
import { BuildCategories } from '../common/build-categories';
import { Template } from '../common/template/template';
import { Tool, ToolType } from '../common/tools/tool';
import { TileInfo } from '../common/tile-info';
import { TemplateItemWire } from '../common/template/template-item-wire';
import { Camera } from '../common/camera';
import { Vector2 } from '../common/vector2';
import { DrawHelpers } from '../drawing/draw-helpers';
import { ToolRequest } from '../common/tool-request';



@Component({
  selector: 'app-component-side-build-tool',
  templateUrl: './component-side-build-tool.component.html',
  styleUrls: ['./component-side-build-tool.component.css']
})
export class ComponentSideBuildToolComponent implements OnInit, Tool {

  categories: SelectItem[];
  items: OniItem[];

  // This is used by the accordeon
  activeIndex=0;

  currentCategory: BuildCategories;
  currentItem: OniItem;

  templateItemToBuild: TemplateItem;

  @Output() onAskChangeTool = new EventEmitter<ToolRequest>();

  constructor() 
  {

    this.categories = []
    for (let i = 0; i <= 14; i++)
    {
      let newCategory: BuildCategories = i;
      this.categories.push({label:BuildCategories[newCategory], value:newCategory});
    }

    this.items = [];

  }

  ngOnInit() {
    
    this.currentCategory = BuildCategories.Base;
    this.currentItem = OniItem.getOniItem('Tile');
    this.changeCategory();
    
  }

  oniItemsLoaded()
  {
    this.changeCategory();
  }

  updateItemList()
  {
    this.items = OniItem.oniItems.filter(i => i.category == this.currentCategory);
  }

  changeCategory()
  {
    this.updateItemList();
    if (this.items.length >= 1) this.currentItem = this.items[0]
    this.changeItem();
  }

  changeItem()
  {

    // Create the templateItem which will be shared by this component and the canvas tool
    this.templateItemToBuild = Template.createInstance(this.currentItem.id);
    this.templateItemToBuild.temperature = 300;
    this.templateItemToBuild.element = ComposingElement.getElement('Void');

    this.changeItem_(this.templateItemToBuild);

    // TODO o to change orientation
  }

  setOriginal(templateItem: TemplateItem)
  {
    // TODO in setTemplateItem
    this.currentCategory = templateItem.oniItem.category;
    this.currentItem = templateItem.oniItem;

    
    this.templateItemToBuild = templateItem;
  }


  changeItem_(item: TemplateItem)
  {
    this.templateItemToBuild = item;
    // TODO should the position go into cleanup
    this.templateItemToBuild.position = Vector2.Zero;
    this.templateItemToBuild.alpha = 1;
    this.templateItemToBuild.cleanUp();
    // TODO fixme
    //this.templateItemToBuild.prepareSpriteInfoModifier(blueprint);
    this.templateItemToBuild.prepareBoundingBox();
  }




  


  private canBuild(blueprint: Template, tile: Vector2): boolean
  {
    // TODO we should loop the tiles of the templateItemToBuild according to it's bounding box
    let alreadyPresent = false;
    for (let templateItem of blueprint.getTemplateItemsAt(tile)) 
      if (templateItem.id == this.templateItemToBuild.id) 
        alreadyPresent = true;

    return !alreadyPresent;
  }



  private connectAToB(a: TemplateItemWire, b: TemplateItemWire)
  {
    console.log('connectAToB');
    let bitMask = 0;
    if (a.position.x == b.position.x + 1 && a.position.y == b.position.y) bitMask = 1;
    else if (a.position.x == b.position.x - 1 && a.position.y == b.position.y) bitMask = 2;
    else if (a.position.x == b.position.x && a.position.y == b.position.y - 1) bitMask = 4;
    else if (a.position.x == b.position.x && a.position.y == b.position.y + 1) bitMask = 8;

    a.connections = a.connections | bitMask;
  }

  build(blueprint: Template)
  {
    // TODO the canbuild should not need the position
    if (!this.canBuild(blueprint, this.templateItemToBuild.position)) return;

    let newItem = this.templateItemToBuild.clone();
    newItem.prepareBoundingBox();
    blueprint.addTemplateItem(newItem);
    blueprint.refreshOverlayInfo()
  }


  /************************
  ** Tool interface      **
  ************************/
  toolType = ToolType.build;
  
  setTemplateItem(templateItem: TemplateItem) 
  {
    // TODO fixme
    if (templateItem != null) this.changeItem_(templateItem.cloneForBuilding());
    else
    {
      this.changeItem();
    }
  }

  leftMouseDown(blueprint: Template, tile: Vector2) 
  {
    this.templateItemToBuild.position = tile;
    this.build(blueprint);
  }

  leftMouseUp(blueprint: Template, tile: Vector2) 
  {
    // TODO tentative placement, build on leftMouseUp
  }

  leftClick(blueprint: Template, tile: Vector2)
  {
    this.templateItemToBuild.position = tile;
    this.build(blueprint);
  }

  rightClick(blueprint: Template, tile: Vector2)
  {
    this.onAskChangeTool.emit({toolType:ToolType.select, templateItem:null});
  }

  changeTile(blueprint: Template, previousTile: Vector2, currentTile: Vector2)
  {
    this.templateItemToBuild.position = currentTile;

    if (this.canBuild(blueprint, currentTile)) this.templateItemToBuild.frontColor = DrawHelpers.whiteColor;
    else this.templateItemToBuild.frontColor = '#D40000';
  }

  changeTileDrag(blueprint: Template, previousTileDrag: Vector2, currentTileDrag: Vector2)
  {
    this.templateItemToBuild.position = currentTileDrag;
    this.build(blueprint);

    if (this.templateItemToBuild.oniItem.isWire)
    {
      let itemsPrevious = blueprint.getTemplateItemsAt(previousTileDrag).filter(i => i.id == this.templateItemToBuild.id);
      let itemsCurrent = blueprint.getTemplateItemsAt(currentTileDrag).filter(i => i.id == this.templateItemToBuild.id);

      if (itemsPrevious != null && itemsPrevious.length > 0 && itemsCurrent != null && itemsCurrent.length > 0)
      {
        let itemPrevious = itemsPrevious[0] as TemplateItemWire;
        let itemCurrent = itemsCurrent[0] as TemplateItemWire;

        this.connectAToB(itemPrevious, itemCurrent);
        this.connectAToB(itemCurrent, itemPrevious);
        itemPrevious.prepareSpriteInfoModifier(blueprint);
        itemCurrent.prepareSpriteInfoModifier(blueprint);
      }
    }
  }

  prepareSpriteInfoModifier(blueprint: Template)
  {
    this.templateItemToBuild.prepareSpriteInfoModifier(blueprint);
    this.templateItemToBuild.prepareBoundingBox();
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera)
  {
    this.templateItemToBuild.draw(ctx, camera);
    this.templateItemToBuild.drawUtility(ctx, camera);
  }
}
