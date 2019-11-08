import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { TileInfo } from '../../../common/tile-info';
import { TemplateItem } from '../../../common/template/template-item';
import { ToolType } from '../../../common/tools/tool';
import { Template } from '../../../common/template/template';
import { Vector2 } from '../../../common/vector2';
import { CameraService } from '../../../services/camera-service';
import { BlueprintService } from '../../../services/blueprint-service';
import { ToolService } from '../../../services/tool-service';
import { IObsTemplateItemChanged } from '../../../common/tools/select-tool';

@Component({
  selector: 'app-selection-tool',
  templateUrl: './selection-tool.component.html',
  styleUrls: ['./selection-tool.component.css']
})
export class ComponentSideSelectionToolComponent implements OnInit, IObsTemplateItemChanged {

  constructor(private cd: ChangeDetectorRef, private blueprintService: BlueprintService, private toolService: ToolService) 
  { 
  }

  ngOnInit() {
    this.toolService.selectTool.subscribe(this);
  }

  newSelection()
  {
    this.cd.detectChanges();
  }

  nextSelection()
  {
    // First find the current real active index
    let realActiveIndex = -1;
    for (let currentActiveIndex = 0; currentActiveIndex < this.toolService.selectTool.templateItemsToShow.length; currentActiveIndex++)
      if (this.toolService.selectTool.templateItemsToShow[currentActiveIndex].selected)
        realActiveIndex = currentActiveIndex;

    realActiveIndex++;
    realActiveIndex = realActiveIndex % this.toolService.selectTool.templateItemsToShow.length;
    

    for (let currentActiveIndex = 0; currentActiveIndex < this.toolService.selectTool.templateItemsToShow.length; currentActiveIndex++)
      this.toolService.selectTool.templateItemsToShow[currentActiveIndex].selectedSingle = (currentActiveIndex == realActiveIndex);

  }
  
  destroyTemplateItem()
  {
    this.cd.detectChanges();
  }
}
