import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { OniBuilding } from '../oni-import/oni-building';
import { Dialog } from 'primeng/dialog';
import { Accordion, AccordionTab } from 'primeng/accordion';
import { TileInfo } from '../common/tile-info';
import { OniCell } from '../oni-import/oni-cell';
import { TemplateItem } from '../common/template/template-item';
import { ComponentSideSelectionToolComponent } from '../component-side-selection-tool/component-side-selection-tool.component';
import { ToolType, Tool } from '../common/tools/tool';
import { ComponentSideBuildToolComponent } from '../component-side-build-tool/component-side-build-tool.component';
import { OniItem } from '../common/oni-item';
import { ToolRequest } from '../common/tool-request';

interface Element {
  name: string,
  code: string
}

@Component({
  selector: 'app-component-side-panel',
  templateUrl: './component-side-panel.component.html',
  styleUrls: ['./component-side-panel.component.css']
})
export class ComponentSidepanelComponent implements OnInit {

  public header: string

  @ViewChild('selectionTool', {static: true})
  selectionTool: ComponentSideSelectionToolComponent

  @ViewChild('buildTool', {static: true})
  buildTool: ComponentSideBuildToolComponent

  @Output() onAskChangeTool = new EventEmitter<ToolRequest>();

  constructor() { 
    
  }

  ngOnInit() {
    this.header = "No tool selected";

  }

  private currentTool: ToolType
  public changeTool(newTool: ToolRequest) : Tool
  {
    this.currentTool = newTool.toolType;

    let returnValue: Tool
    switch (this.currentTool)
    {
      case ToolType.select:
        returnValue = this.selectionTool;
        break;
      case ToolType.build:
        returnValue = this.buildTool;
        break;
      default:
        throw new Error('ComponentSidepanelComponent.changeTool');
    }

    returnValue.setTemplateItem(newTool.templateItem);

    return returnValue;
  }

  askChangeTool(toolRequest: ToolRequest)
  {
    this.onAskChangeTool.emit(toolRequest);
  }

  // TODO common to all tools
  public updateSelectionTool(tileInfo: TileInfo)
  {
    //this.changeTool(ToolType.select);
    this.header = "Tile : {x: "+tileInfo.tileCoords.x+", y: "+tileInfo.tileCoords.y+"}"; 
    
    // TODO switch tool
    this.selectionTool.updateSelectionTool();

  }

  oniItemsLoaded()
  {
    this.buildTool.oniItemsLoaded();
  }

}
