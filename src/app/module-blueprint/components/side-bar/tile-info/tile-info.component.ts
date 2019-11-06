import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TemplateItem } from '../../../common/template/template-item';
import { ComposingElement } from '../../../common/composing-element';
import { TemplateItemWire } from '../../../common/template/template-item-wire';
import { AuthorizedOrientations } from '../../../common/oni-item';
import { SelectItem } from 'primeng/api';
import { ToolType } from '../../../common/tools/tool';
import { BlueprintService } from '../../../services/blueprint-service';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';

@Component({
  selector: 'app-tile-info',
  templateUrl: './tile-info.component.html',
  styleUrls: ['./tile-info.component.css']
})
export class TileInfoComponent implements OnInit, OnDestroy {


  @Input() templateItem: TemplateItem;
  @Output() onDestroyTemplateItem = new EventEmitter();

  get elements() { return ComposingElement.elements; }
  get showColor() { return this.templateItem instanceof TemplateItemWire }
  get showOrientation() { return this.templateItem.oniItem.orientations.length > 1 }


  get authorizedOrientations(): SelectItem[] 
  {
    let returnValue: SelectItem[] = [];
    for (let authorizedOrientation of this.templateItem.oniItem.orientations) 
      returnValue.push({value:authorizedOrientation, label:AuthorizedOrientations[authorizedOrientation]});

    return returnValue;
  }


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
    this.blueprintService.blueprint.destroyTemplateItem(this.templateItem);
    
    // We still need to do the detection change one loevel above? weird
    this.onDestroyTemplateItem.emit();
  }

}
