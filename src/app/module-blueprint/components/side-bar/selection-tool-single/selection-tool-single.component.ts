import { Component, OnInit } from '@angular/core';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';

@Component({
  selector: 'app-selection-tool-single',
  templateUrl: './selection-tool-single.component.html',
  styleUrls: ['./selection-tool-single.component.css']
})
export class SelectionToolSingleComponent implements OnInit {

  constructor(private toolService: ToolService) { }

  ngOnInit() {
  }

  

}
