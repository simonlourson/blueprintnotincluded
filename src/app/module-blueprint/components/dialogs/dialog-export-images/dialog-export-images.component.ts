import { Component, OnInit } from '@angular/core';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { OverlayCheck, Overlay } from 'src/app/module-blueprint/common/overlay-type';
import { DrawHelpers } from 'src/app/module-blueprint/drawing/draw-helpers';

@Component({
  selector: 'app-dialog-export-images',
  templateUrl: './dialog-export-images.component.html',
  styleUrls: ['./dialog-export-images.component.css']
})
export class DialogExportImagesComponent implements OnInit {

  visible: boolean = false;

  overlaysToExport: OverlayCheck[];

  constructor(private blueprintService: BlueprintService) { 
    this.overlaysToExport = [
      {overlay: Overlay.Base, name:DrawHelpers.overlayString[Overlay.Base], checked:true}
    ]
  }

  ngOnInit() {
  }

  hideDialog() {
    this.visible = false;
  }

  showDialog()
  {
    this.visible = true;
  }

}
