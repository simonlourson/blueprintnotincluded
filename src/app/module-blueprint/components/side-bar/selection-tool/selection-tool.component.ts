import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { TileInfo } from '../../../common/tile-info';
import { BlueprintItem } from '../../../common/blueprint/blueprint-item';
import { ToolType } from '../../../common/tools/tool';
import { Blueprint } from '../../../common/blueprint/blueprint';
import { Vector2 } from '../../../common/vector2';
import { CameraService } from '../../../services/camera-service';
import { BlueprintService } from '../../../services/blueprint-service';
import { ToolService } from '../../../services/tool-service';
import { IObsTemplateItemChanged } from '../../../common/tools/select-tool';
import { SelectionType } from '../../../common/tools/select-tool';

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
  }

  nextSelection()
  {
  }
}
