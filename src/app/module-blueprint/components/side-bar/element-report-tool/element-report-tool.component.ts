import { Component, OnInit } from '@angular/core';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';
import { Visualization, BuildableElement } from '../../../../../../../blueprintnotincluded-lib/index';
import { CameraService } from 'src/app/module-blueprint/services/camera-service';

@Component({
  selector: 'app-element-report-tool',
  templateUrl: './element-report-tool.component.html',
  styleUrls: ['./element-report-tool.component.css']
})
export class ElementReportToolComponent implements OnInit {

  get data() { return this.toolService.elementReport.data }

  constructor(private toolService: ToolService, private cameraService: CameraService) { }

  selectEveryElement(buildableElement: BuildableElement) {
    this.toolService.selectTool.selectEveryElement(buildableElement);
  }

  ngOnInit() {
  }

  close() {
    this.cameraService.visualization = Visualization.none;
  }
}
