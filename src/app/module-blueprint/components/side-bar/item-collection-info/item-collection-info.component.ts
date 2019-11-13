import { Component, OnInit, Input } from '@angular/core';
import { SameItemCollection } from 'src/app/module-blueprint/common/tools/same-item-collection';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';
import { ToolType } from 'src/app/module-blueprint/common/tools/tool';
import { Blueprint } from 'src/app/module-blueprint/common/blueprint/blueprint';

@Component({
  selector: 'app-item-collection-info',
  templateUrl: './item-collection-info.component.html',
  styleUrls: ['./item-collection-info.component.css']
})
export class ItemCollectionInfoComponent implements OnInit {

  nbItems: string;
  @Input() itemCollection: SameItemCollection;

  constructor(private blueprintService: BlueprintService, private toolService: ToolService) { }

  ngOnInit() {
    this.nbItems = this.itemCollection.items.length +  ' item' + (this.itemCollection.items.length > 1 ? 's' : '') + ' selected'
  }

  buildingsDestroy() {
    this.toolService.selectTool.buildingsDestroy(this.itemCollection);
  }

  removeFromSelection() {
    this.toolService.selectTool.removeFromSelection(this.itemCollection);
  }

  buildingsCopy() {
    this.toolService.changeTool(ToolType.build);
    this.toolService.buildTool.changeItem(Blueprint.createInstance(this.itemCollection.oniItem.id) );
  }

}
