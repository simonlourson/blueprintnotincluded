import { Component, OnInit } from '@angular/core';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { OverlayCheck, Overlay } from 'src/app/module-blueprint/common/overlay-type';
import { DrawHelpers } from 'src/app/module-blueprint/drawing/draw-helpers';
import { CameraService } from 'src/app/module-blueprint/services/camera-service';

@Component({
  selector: 'app-dialog-export-images',
  templateUrl: './dialog-export-images.component.html',
  styleUrls: ['./dialog-export-images.component.css']
})
export class DialogExportImagesComponent implements OnInit {

  visible: boolean = false;
  val: Number

  overlaysToExport: OverlayCheck[];
  get zoomLevels() { return this.cameraService.zoomLevels; }
  get minZoomLevel() { return Math.min(...this.zoomLevels); }
  get maxZoomLevel() { return Math.max(...this.zoomLevels); }

  constructor(private blueprintService: BlueprintService, private cameraService: CameraService) { 
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
