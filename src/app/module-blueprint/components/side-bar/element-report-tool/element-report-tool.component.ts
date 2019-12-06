import { Component, OnInit } from '@angular/core';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';

@Component({
  selector: 'app-element-report-tool',
  templateUrl: './element-report-tool.component.html',
  styleUrls: ['./element-report-tool.component.css']
})
export class ElementReportToolComponent implements OnInit {

  get data() { return this.toolService.elementReportTool.data }

  constructor(private toolService: ToolService) { }

  ngOnInit() {
  }

}
