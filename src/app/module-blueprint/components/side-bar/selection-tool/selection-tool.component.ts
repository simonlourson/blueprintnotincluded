import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, ViewChild, ElementRef, Renderer2, OnChanges, AfterViewChecked, AfterViewInit } from '@angular/core';
import { BlueprintItem } from '../../../common/blueprint/blueprint-item';
import { ToolType } from '../../../common/tools/tool';
import { Blueprint } from '../../../common/blueprint/blueprint';
import { Vector2 } from '../../../common/vector2';
import { CameraService } from '../../../services/camera-service';
import { BlueprintService } from '../../../services/blueprint-service';
import { ToolService } from '../../../services/tool-service';
import { Accordion } from 'primeng/accordion';
import { IObsSelectionChanged } from 'src/app/module-blueprint/common/tools/select-tool';

@Component({
  selector: 'app-selection-tool',
  templateUrl: './selection-tool.component.html',
  styleUrls: ['./selection-tool.component.css']
})
export class ComponentSideSelectionToolComponent implements OnInit {

  @ViewChild('buildingsAccordion', {static: true}) buildingsAccordion: Accordion;
  @ViewChild('selectToolCard', {static: true}) selectToolCard: ElementRef;

  constructor(
    private blueprintService: BlueprintService, 
    public toolService: ToolService,
    private renderer: Renderer2) 
  { 
  }

  ngOnInit() {
  }


  setMaxHeight(position: number) {
    this.renderer.setStyle(this.selectToolCard.nativeElement, 'max-height', 'calc(100vh - ' + position + 'px - 20px)');
  }

  itemGroupeNext() {
    this.toolService.selectTool.itemGroupeNext();
  }

  itemGroupePrevious() {
    this.toolService.selectTool.itemGroupePrevious();
  }

  destroyAll() {
    this.toolService.selectTool.destroyAll();
  }
}
