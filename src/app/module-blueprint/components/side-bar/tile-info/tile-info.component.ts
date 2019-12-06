import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BlueprintItem } from '../../../common/blueprint/blueprint-item';
import { BlueprintItemWire } from '../../../common/blueprint/blueprint-item-wire';
import { Orientation } from '../../../common/oni-item';
import { SelectItem } from 'primeng/api';
import { ToolType } from '../../../common/tools/tool';
import { BlueprintService } from '../../../services/blueprint-service';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';
import { BuildableElement } from 'src/app/module-blueprint/common/bexport/b-element';

@Component({
  selector: 'app-tile-info',
  templateUrl: './tile-info.component.html',
  styleUrls: ['./tile-info.component.css']
})
export class TileInfoComponent implements OnInit, OnDestroy {


  @Input() templateItem: BlueprintItem;
  @Input() build: boolean;

  get showColor() { return this.templateItem instanceof BlueprintItemWire }
  get showOrientation() { return this.templateItem.oniItem.orientations.length > 1 }

  constructor(private blueprintService: BlueprintService, private toolService: ToolService) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    
  }

  changeOrientation(event: any)
  {
    // Change the rotation and scale
    this.templateItem.changeOrientation(this.templateItem.orientation);
    this.templateItem.prepareBoundingBox();
  }

  buildCopy(event: any)
  {
    this.toolService.changeTool(ToolType.build);
    this.toolService.buildTool.changeItem(this.templateItem.cloneForBuilding());
  }

  buildDestroy(event: any)
  {
    // TODO this should trigger an event that should be listened to by side panel
    this.blueprintService.blueprint.destroyBlueprintItem(this.templateItem);
  }

}
