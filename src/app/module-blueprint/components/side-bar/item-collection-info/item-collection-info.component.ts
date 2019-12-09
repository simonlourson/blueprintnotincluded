import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SameItemCollection, IObsSelected } from 'src/app/module-blueprint/common/tools/same-item-collection';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';
import { ToolType } from 'src/app/module-blueprint/common/tools/tool';
import { Blueprint } from 'src/app/module-blueprint/common/blueprint/blueprint';
import { BlueprintHelpers } from 'src/app/module-blueprint/common/blueprint/blueprint-helpers';
import { BuildableElement } from 'src/app/module-blueprint/common/bexport/b-element';
import { ElementChangeInfo } from '../buildable-element-picker/buildable-element-picker.component';

@Component({
  selector: 'app-item-collection-info',
  templateUrl: './item-collection-info.component.html',
  styleUrls: ['./item-collection-info.component.css']
})
export class ItemCollectionInfoComponent implements OnInit, IObsSelected {

  nbItems: string;
  @Input() itemCollection: SameItemCollection;

  @ViewChild('focusElement', {static: true}) focusElement: ElementRef;

  get debug() { 
    let debug = this.itemCollection.items[0] as any;
    let debugInfo = {connections: debug.connections };
    return JSON.stringify(debugInfo);
  }

  constructor(private blueprintService: BlueprintService, private toolService: ToolService) { }

  ngOnInit() {
    this.nbItems = this.itemCollection.items.length +  ' item' + (this.itemCollection.items.length > 1 ? 's' : '') + ' selected'
    this.itemCollection.subscribeSelected(this);
  }

  buildingsDestroy() {
    this.toolService.selectTool.buildingsDestroy(this.itemCollection);
  }

  buildingsCopy() {
    this.toolService.changeTool(ToolType.build);
    
    let newItem = BlueprintHelpers.cloneBlueprintItem(this.itemCollection.items[0]);

    this.toolService.buildTool.changeItem(newItem);
  }

  selectEvery() {
    this.toolService.selectTool.selectAll(this.itemCollection.oniItem);
  }

  selected() {
    this.focusElement.nativeElement.focus();
  }

  changeElement(elementChangeInfo: ElementChangeInfo) {
    // TODO confirm dialog

    this.itemCollection.items.map((item) => {
      item.setElement(elementChangeInfo.newElement.id, elementChangeInfo.index);
    });

    this.itemCollection.updateNbElements();
    this.blueprintService.blueprint.emitBlueprintChanged();
  }
}
