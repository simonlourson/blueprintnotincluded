import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { OniBuilding } from '../../../oni-import/oni-building';
import { Dialog } from 'primeng/dialog';
import { Accordion, AccordionTab } from 'primeng/accordion';
import { TileInfo } from '../../../common/tile-info';
import { OniCell } from '../../../oni-import/oni-cell';
import { TemplateItem } from '../../../common/template/template-item';
import { ComponentSideSelectionToolComponent } from '../selection-tool/selection-tool.component';
import { ToolType } from '../../../common/tools/tool';
import { ComponentSideBuildToolComponent } from '../component-side-build-tool/component-side-build-tool.component';
import { OniItem } from '../../../common/oni-item';
import { ToolService } from '../../../services/tool-service';

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

  @Output() onDestroyTemplateItem = new EventEmitter<TemplateItem>();

  constructor(private toolService: ToolService) { 
    
  }

  ngOnInit() {
    this.header = "No tool selected";

  }

  oniItemsLoaded()
  {
    this.buildTool.oniItemsLoaded();
  }

}
