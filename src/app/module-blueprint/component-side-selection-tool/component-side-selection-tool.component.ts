import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { TileInfo } from '../common/tile-info';
import { TemplateItem } from '../common/template/template-item';
import { ToolRequest } from '../common/tool-request';
import { Tool, ToolType } from '../common/tools/tool';
import { Template } from '../common/template/template';
import { Vector2 } from '../common/vector2';
import { Camera } from '../common/camera';

@Component({
  selector: 'app-component-side-selection-tool',
  templateUrl: './component-side-selection-tool.component.html',
  styleUrls: ['./component-side-selection-tool.component.css']
})
export class ComponentSideSelectionToolComponent implements OnInit, Tool {

  private tileInfo: TileInfo;

  activeIndex : number;
  templateItemsToShow: TemplateItem[];


  constructor(private cd: ChangeDetectorRef) 
  { 
    this.templateItemsToShow = [];
    this.tileInfo = new TileInfo();
  }

  ngOnInit() {
  }

  // This is used by the "Build Copy" button
  @Output() onAskChangeTool = new EventEmitter<ToolRequest>();
  askChangeTool(toolRequest: ToolRequest)
  {
    this.onAskChangeTool.emit(toolRequest);
  }

  // This is used a bunch of times by the tool interface to refresh the display
  public updateSelectionTool()
  {
    this.templateItemsToShow = [];

    // We only show the selected templateItem on top if it is not on the current tile
    if (!this.tileInfo.isCurrentSelectionInList && this.tileInfo.selected != null) this.templateItemsToShow.push(this.tileInfo.selected);

    for (let templateItem of this.tileInfo.templateItems)
    {
      if (templateItem != this.tileInfo.selected || this.tileInfo.isCurrentSelectionInList) 
      {
        this.templateItemsToShow.push(templateItem);
      }
    }

    // We calculate the activeIndex by iterating on the items to show
    let currentActiveIndex = 0;
    this.activeIndex = -1;  
    for (let itemToShow of this.templateItemsToShow)
    {
      if (itemToShow == this.tileInfo.selected) 
      {
        this.activeIndex = currentActiveIndex; 
        break;
      }
      currentActiveIndex++;
    }



    if (this.tileInfo.templateItems.length /*+ this.cellsToShow.length*/ == 0)
    {
      //this.cellsToShow.push(new OniCell());
    }

    // TODO we should take into account user clicking of the accordeon
    //this.activeIndex = tileInfo.indexSelected;

    // Angular is weird
    this.cd.detectChanges();
  }

  /************************
  ** Tool interface      **
  ************************/
  toolType = ToolType.select;

  setTemplateItem(templateItem: TemplateItem) {}

  leftMouseDown(blueprint: Template, tile: Vector2) {}
  leftMouseUp(blueprint: Template, tile: Vector2) {}

  leftClick(blueprint: Template, tile: Vector2)
  {
    this.tileInfo.nextSelection();
    this.updateSelectionTool();
  }
  
  rightClick(blueprint: Template, tile: Vector2)
  {
    this.tileInfo.unselectAll();
    this.updateSelectionTool();
  }

  changeTile(blueprint: Template, previousTile: Vector2, currentTile: Vector2)
  {
    this.tileInfo.tileCoords = currentTile;
    this.tileInfo.addTemplateItems(blueprint.getTemplateItemsAt(currentTile));
    this.updateSelectionTool();
  }

  changeTileDrag(blueprint: Template, previousTileDrag: Vector2, currentTileDrag: Vector2) {}

  prepareSpriteInfoModifier(blueprint: Template) {}

  draw(ctx: CanvasRenderingContext2D, camera: Camera) 
  {
    // TODO draw yellow
  }

}
