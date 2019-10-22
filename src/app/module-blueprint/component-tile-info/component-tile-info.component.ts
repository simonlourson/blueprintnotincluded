import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TemplateItem } from '../common/template/template-item';
import { ComposingElement } from '../common/composing-element';
import { TemplateItemWire } from '../common/template/template-item-wire';
import { AuthorizedOrientations } from '../common/oni-item';
import { SelectItem } from 'primeng/api';
import { ToolRequest } from '../common/tool-request';
import { ToolType } from '../common/tools/tool';

@Component({
  selector: 'app-component-tile-info',
  templateUrl: './component-tile-info.component.html',
  styleUrls: ['./component-tile-info.component.css']
})
export class ComponentTileInfoComponent implements OnInit, OnDestroy {


  @Input() templateItem: TemplateItem;
  @Output() onAskChangeTool = new EventEmitter<ToolRequest>();

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


  constructor(private cdRef: ChangeDetectorRef) { }

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
    let toolRequest = new ToolRequest();
    toolRequest.toolType = ToolType.build;
    toolRequest.templateItem = this.templateItem;

    this.onAskChangeTool.emit(toolRequest);
  }

  buildDestroy()
  {
    this.templateItem.destroy();
  }

}
