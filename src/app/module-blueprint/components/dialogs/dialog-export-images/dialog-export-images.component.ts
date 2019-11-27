import { Component, OnInit } from '@angular/core';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { OverlayCheck, Overlay } from 'src/app/module-blueprint/common/overlay-type';
import { DrawHelpers } from 'src/app/module-blueprint/drawing/draw-helpers';
import { CameraService } from 'src/app/module-blueprint/services/camera-service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-dialog-export-images',
  templateUrl: './dialog-export-images.component.html',
  styleUrls: ['./dialog-export-images.component.css']
})
export class DialogExportImagesComponent implements OnInit {

  checked: boolean;
  gridLines: boolean;
  visible: boolean = false;

  currentPixelPerTile: SelectItem;
  pixelPerTile: SelectItem[];
  

  overlaysToExport: OverlayCheck[];
  get zoomLevels() { return this.cameraService.zoomLevels; }
  get minZoomLevel() { return Math.min(...this.zoomLevels); }
  get maxZoomLevel() { return Math.max(...this.zoomLevels); }

  constructor(private blueprintService: BlueprintService, private cameraService: CameraService) { 
    

    
  }

  ngOnInit() {
    let overlayList: Overlay[] = [
      Overlay.Base,
      Overlay.Power,
      Overlay.Liquid,
      Overlay.Gas,
      Overlay.Automation,
      Overlay.Conveyor
    ]

    this.overlaysToExport = [];
    overlayList.map((overlay) => {
      this.overlaysToExport.push({overlay: overlay, name:DrawHelpers.overlayString[overlay], checked:true});
    });

    this.pixelPerTile = [
      {label:'16 pixels per tile', value:16},
      {label:'24 pixels per tile', value:24},
      {label:'32 pixels per tile', value:32},
      {label:'48 pixels per tile', value:48},
      {label:'64 pixels per tile', value:64},
      {label:'96 pixels per tile', value:96},
      {label:'128 pixels per tile', value:128}
    ];

    this.currentPixelPerTile = this.pixelPerTile[2];
  }

  hideDialog() {
    this.visible = false;
  }

  showDialog()
  {
    this.visible = true;
  }

}
