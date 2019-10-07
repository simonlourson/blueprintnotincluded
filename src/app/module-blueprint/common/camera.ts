import { Vector2 } from "src/app/module-blueprint/common/vector2";
import { OverlayType } from "./overlay-type";

export class Camera
{
    
    targetCameraOffset: Vector2;

    // Offset is in tile coordinates
    cameraOffset: Vector2;

    // Zoom is the number of pixels between cells
    currentZoom: number;

    overlay: OverlayType;
    
    private targetZoom: number;
    private lastZoomCenter: Vector2;

    constructor()
    {
        this.cameraOffset = new Vector2();
        this.targetCameraOffset = new Vector2();
        this.currentZoomIndex = 7;
        this.targetZoom = this.currentZoom = this.zoomLevels[this.currentZoomIndex];
    }

    updateZoom()
    {


        // TODO smooth this
        /*
        if (Math.abs(this.cameraOffset.x - this.targetCameraOffset.x) < 0.1) 
            this.cameraOffset.x = this.targetCameraOffset.x;
        else 
            this.cameraOffset.x += (this.targetCameraOffset.x - this.cameraOffset.x) / 10;

        if (Math.abs(this.cameraOffset.y - this.targetCameraOffset.y) < 0.1) 
            this.cameraOffset.y = this.targetCameraOffset.y;
        else 
            this.cameraOffset.y += (this.targetCameraOffset.y - this.cameraOffset.y) / 10;
        */

        // Snap if close enough
        if (this.currentZoom == this.targetZoom)
            return;
        if (Math.abs(this.currentZoom - this.targetZoom) < 0.1)
            this.changeZoom(this.targetZoom - this.currentZoom, this.lastZoomCenter);
        else
            this.changeZoom((this.targetZoom - this.currentZoom) / 10, this.lastZoomCenter);

    }

    resetZoom(canvasSize: Vector2)
    {
      this.currentZoomIndex = 7;
      this.targetZoom = this.currentZoom = this.zoomLevels[this.currentZoomIndex];

      this.cameraOffset.x = canvasSize.x * 0.5 / this.currentZoom;
      this.cameraOffset.y = canvasSize.y * 0.5 / this.currentZoom;
    }

    private zoomLevels: number[] = [16, 18, 20, 23, 27, 32, 38, 45, 54, 64, 76, 90, 108, 128]
    private currentZoomIndex: number
    zoom(delta: number, zoomCenter: Vector2)
    {
        this.lastZoomCenter = zoomCenter;
        this.currentZoomIndex += delta;
        if (this.currentZoomIndex < 0) this.currentZoomIndex = 0;
        if (this.currentZoomIndex >= this.zoomLevels.length) this.currentZoomIndex = this.zoomLevels.length - 1;

        this.targetZoom = this.zoomLevels[this.currentZoomIndex];
    }

    changeZoom(zoomDelta: number, zoomCenter: Vector2)
    {
        // TODO fix targetCameraOffset
        let oldZoomCenterTile: Vector2 = this.getTileCoordsForZoom(zoomCenter);

        this.currentZoom += zoomDelta;

        let newZoomCenterTile: Vector2 = this.getTileCoordsForZoom(zoomCenter);

        this.cameraOffset.x += newZoomCenterTile.x - oldZoomCenterTile.x;
        this.cameraOffset.y += newZoomCenterTile.y - oldZoomCenterTile.y;
        this.targetCameraOffset.x += newZoomCenterTile.x - oldZoomCenterTile.x;
        this.targetCameraOffset.y += newZoomCenterTile.y - oldZoomCenterTile.y;
    }

    // TODO refactor this
    getTileCoordsForZoom(screenCoords: Vector2): Vector2 
    {
        let returnValue: Vector2 = new Vector2();

        returnValue.x = screenCoords.x / this.currentZoom - this.cameraOffset.x;
        returnValue.y = screenCoords.y / this.currentZoom - this.cameraOffset.y;

        return returnValue;
    }

    getTileCoords(cursorPosition: Vector2): Vector2
    {
        return new Vector2(
        cursorPosition.x / this.currentZoom - this.cameraOffset.x,
        -cursorPosition.y / this.currentZoom + this.cameraOffset.y
        );
    }

}