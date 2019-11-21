import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BlueprintListItem } from 'src/app/module-blueprint/services/blueprint-list-item';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { Dialog } from 'primeng/dialog';
import { CameraService, IObsAnimationChanged } from 'src/app/module-blueprint/services/camera-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dialog-browse',
  templateUrl: './dialog-browse.component.html',
  styleUrls: ['./dialog-browse.component.css']
})
export class DialogBrowseComponent implements OnInit {

  @ViewChild('browseDialog', {static: true}) browseDialog: Dialog

  visible: boolean = false;
  blueprintListItems: BlueprintListItem[];

  working: boolean;
  firstLoading: boolean;

  get disabled() { return this.working; }
  get icon() { return this.working ? 'pi pi-spin pi-spinner' : ''; }

  constructor(
    private blueprintService: BlueprintService, 
    public datepipe: DatePipe) { 

    this.reset();
  }

  ngOnInit() {
  }

  reset() {
    this.firstLoading = true;
    this.working = true;

    let tempDate = new Date();
    let loadingBlueprintItem: BlueprintListItem = {
      id: null,
      name: 'Loading...',
      ownerName: 'Loading...',
      createdAt: tempDate,
      modifiedAt: tempDate,
      thumbnail: 'svg',
      tags: null
    };

    this.blueprintListItems = [loadingBlueprintItem, loadingBlueprintItem, loadingBlueprintItem, loadingBlueprintItem, loadingBlueprintItem, loadingBlueprintItem];
  }

  openBlueprint(item: BlueprintListItem) {
    this.hideDialog();
    this.blueprintService.openBlueprintFromId(item.id)
  }

  hideDialog() {
    this.visible = false;
  }

  showDialog()
  {
    this.reset();
    this.blueprintService.getBlueprints(new Date()).subscribe({
      next: this.handleGetBlueprints.bind(this)
    });
    this.visible = true;
  }

  handleGetBlueprints(blueprintListItems: BlueprintListItem[]) {
    this.working = false;
    if (this.firstLoading) {
      this.firstLoading = false;
      this.blueprintListItems = [];
      //blueprintListItems.map((item) => { item.thumbnail='svg'; this.blueprintListItems.push(item); });
      blueprintListItems.map((item) => { this.blueprintListItems.push(item); });
    }
    else {
      // TODO remove duplicates
      blueprintListItems.map((item) => { this.blueprintListItems.push(item); });
    }
    //this.recenter();
  }

  loadMoreBlueprints() {
    // Get the oldest date received
    this.working = true;
    let oldestDate = new Date();
    this.blueprintListItems.map((item) => { 
      let createdAt = new Date(item.createdAt);
      if (createdAt.getTime() < oldestDate.getTime()) oldestDate = createdAt; 
    })

    this.blueprintService.getBlueprints(oldestDate).subscribe({
      next: this.handleGetBlueprints.bind(this)
    });

  }
}
