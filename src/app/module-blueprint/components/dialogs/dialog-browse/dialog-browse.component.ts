import { Component, OnInit, ViewChild } from '@angular/core';
import { BlueprintListItem } from 'src/app/module-blueprint/services/blueprint-list-item';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-dialog-browse',
  templateUrl: './dialog-browse.component.html',
  styleUrls: ['./dialog-browse.component.css']
})
export class DialogBrowseComponent implements OnInit {

  @ViewChild('browseDialog', {static: true}) browseDialog: Dialog

  visible: boolean = false;
  blueprintListItems: BlueprintListItem[];

  constructor(private blueprintService: BlueprintService) { 
    this.reset();
  }

  ngOnInit() {
  }

  reset() {
    this.blueprintListItems = [];
  }

  showDialog()
  {
    this.reset();
    this.blueprintService.getBlueprints().subscribe({
      next: this.handleGetBlueprints.bind(this)
    });
    this.visible = true;
  }

  handleGetBlueprints(blueprintListItems: BlueprintListItem[]) {
    if (this.blueprintListItems.length == 0) {
      blueprintListItems.map((item) => { this.blueprintListItems.push(item); })
    }
    this.recenter();
  }

  recenter()
  {
    setTimeout(() => {this.browseDialog.positionOverlay();}, 0)
  }
}
