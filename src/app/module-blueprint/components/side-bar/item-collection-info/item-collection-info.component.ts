import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SameItemCollection, IObsSelected } from 'src/app/module-blueprint/common/tools/same-item-collection';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';
import { ToolType } from 'src/app/module-blueprint/common/tools/tool';
import { Blueprint } from 'src/app/module-blueprint/common/blueprint/blueprint';
import { BlueprintHelpers } from 'src/app/module-blueprint/common/blueprint/blueprint-helpers';

@Component({
  selector: 'app-item-collection-info',
  templateUrl: './item-collection-info.component.html',
  styleUrls: ['./item-collection-info.component.css']
})
export class ItemCollectionInfoComponent implements OnInit, IObsSelected {

  nbItems: string;
  @Input() itemCollection: SameItemCollection;

  @ViewChild('focusElement', {static: true}) focusElement: ElementRef;

  constructor(private blueprintService: BlueprintService, private toolService: ToolService) { }

  ngOnInit() {
    this.nbItems = this.itemCollection.items.length +  ' item' + (this.itemCollection.items.length > 1 ? 's' : '') + ' selected'
    this.itemCollection.subscribeSelected(this);
  }

  buildingsDestroy() {
    this.toolService.selectTool.buildingsDestroy(this.itemCollection);
  }

  removeFromSelection() {
    this.toolService.selectTool.removeFromSelection(this.itemCollection);
  }

  buildingsCopy() {
    this.toolService.changeTool(ToolType.build);
    this.toolService.buildTool.changeItem(BlueprintHelpers.createInstance(this.itemCollection.oniItem.id) );
  }

  selected() {
    this.focusElement.nativeElement.focus();
  }

}
