import { Component, OnInit } from '@angular/core';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';

@Component({
  selector: 'app-selection-tool-multiple',
  templateUrl: './selection-tool-multiple.component.html',
  styleUrls: ['./selection-tool-multiple.component.css']
})
export class SelectionToolMultipleComponent implements OnInit {

  constructor(private toolService: ToolService) { }

  ngOnInit() {
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
