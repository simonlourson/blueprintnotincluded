import { Component, OnInit, ViewChild } from '@angular/core';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { OverlayCheck, Overlay } from 'src/app/module-blueprint/common/overlay-type';
import { DrawHelpers } from 'src/app/module-blueprint/drawing/draw-helpers';
import { CameraService } from 'src/app/module-blueprint/services/camera-service';
import { SelectItem } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { Vector2 } from 'src/app/module-blueprint/common/vector2';

@Component({
  selector: 'app-dialog-export-images',
  templateUrl: './dialog-export-images.component.html',
  styleUrls: ['./dialog-export-images.component.css']
})
export class DialogExportImagesComponent implements OnInit {

  blueprintSize: Vector2;

  checked: boolean;
  gridLines: boolean;
  visible: boolean = false;

  currentPixelPerTile: number;
  pixelPerTile: SelectItem[];

  @ViewChild('pixelPerTileDropdown', {static: true}) pixelPerTileDropdown: Dropdown;
  
  overlayOptions: SelectItem[];
  selectedOverlays: Overlay[];

  get finalSize(): string { return this.blueprintSize == null ? '' : this.blueprintSize.x * this.currentPixelPerTile + 'x' + this.blueprintSize.y * this.currentPixelPerTile }

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

    this.overlayOptions = [];
    overlayList.map((overlay) => {
      this.overlayOptions.push({label: DrawHelpers.overlayString[overlay], value: overlay});
    });

    this.selectedOverlays = [Overlay.Base];

    this.pixelPerTile = [
      {label:'16 pixels per tile', value:16},
      {label:'24 pixels per tile', value:24},
      {label:'32 pixels per tile', value:32},
      {label:'48 pixels per tile', value:48},
      {label:'64 pixels per tile', value:64},
      {label:'96 pixels per tile', value:96},
      {label:'128 pixels per tile', value:128}
    ];

    this.currentPixelPerTile = this.pixelPerTile[2].value;
    DrawHelpers.getOverlayUrl
  }

  getOverlayUrl(overlay: Overlay) {
    return DrawHelpers.getOverlayUrl(overlay);
  }

  overlayString(overlay: Overlay) {
    return DrawHelpers.overlayString[overlay]
  }

  hideDialog() {
    this.visible = false;
  }


  showDialog()
  {
    this.visible = true;

    let boundingBox = this.blueprintService.blueprint.getBoundingBox();
    let topLeft = boundingBox[0];
    let bottomRight = boundingBox[1];
    this.blueprintSize = new Vector2(bottomRight.x - topLeft.x + 3, bottomRight.y - topLeft.y + 3);
  }

}
