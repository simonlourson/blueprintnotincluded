import { Vector2 } from '../../../../../blueprintnotincluded-lib/index'
import { ZIndex, Overlay, Display, Visualization } from "../common/overlay-type";
import { Injectable } from '@angular/core';
import { OniItem } from '../common/oni-item';
import { DrawHelpers } from '../drawing/draw-helpers';

import {  } from 'pixi.js-legacy';
declare var PIXI: any;

@Injectable({ providedIn: 'root' })
export class CameraService
{
    
  targetCameraOffset: Vector2;

  // Offset is in tile coordinates
  cameraOffset: Vector2;

  // Zoom is the number of pixels between cells
  currentZoom: number;

  private overlay_: Overlay;
  get overlay() { return this.overlay_; }
  set overlay(value: Overlay) {
    let emitChange = this.overlay_ != value;
    this.overlay_ = value;
    if (emitChange) {
      this.triggerSortChildren = true;
      this.observersCameraChange.map((observer) => {observer.cameraChanged(this); });
    }
  }

  private display_: Display;
  get display() { return this.display_; }
  set display(value: Display) {
    let emitChange = this.display_ != value;
    this.display_ = value;
    if (emitChange) {
      this.triggerSortChildren = true;
      this.observersCameraChange.map((observer) => {observer.cameraChanged(this); });
    }

    if (value == Display.blueprint) this.visualization = Visualization.none;
  }

  private visualization_: Visualization;
  get visualization() { return this.visualization_; }
  set visualization(value: Visualization) {
    let emitChange = this.visualization_ != value;
    this.visualization_ = value;
    if (emitChange) {
      this.triggerSortChildren = true;
      this.observersCameraChange.map((observer) => {observer.cameraChanged(this); });
    }

    if (value != Visualization.none) this.display = Display.solid;
  }

  get showElementReport() { return this.visualization == Visualization.elements; } 
  get showTemperatureScale() { return this.visualization == Visualization.temperature; }

  spinner: number;

  private sinWaveTime: number;
  sinWave: number;
  
  private targetZoom: number;
  private lastZoomCenter: Vector2;

  public triggerSortChildren: boolean;

  public container: PIXI.Container;
  public addToContainer(child: any) {
    this.container.addChild(child);
    this.triggerSortChildren = true;
  }

  // For classes that want to use the service and are not created by angular
  static cameraService: CameraService;

  constructor()
  {
    this.cameraOffset = new Vector2();
    this.targetCameraOffset = new Vector2();
    this.currentZoomIndex = 7;
    //this.currentZoomIndex = 13;
    this.targetZoom = this.currentZoom = this.zoomLevels[this.currentZoomIndex];
    this.sinWaveTime = 0;
    this.sinWave = 0;
    this.spinner = 0;

    this.triggerSortChildren = true;

    this.observersCameraChange = [];
    this.observersToAnimationChange = [];

    this.overlay = -1;//Overlay.Base;
    this.display = -1;//Display.solid;
    this.visualization = -1;//Visualization.none;

    if (CameraService.cameraService == null) CameraService.cameraService = this;
  }

  observersCameraChange: IObsCameraChanged[];
  subscribeCameraChange(observer: IObsCameraChanged) {
    this.observersCameraChange.push(observer);
  }

  observersToAnimationChange: IObsAnimationChanged[];
  subscribeAnimationChange(observer: IObsAnimationChanged) {
    this.observersToAnimationChange.push(observer);
  }

  setOverlayForItem(item: OniItem) {
    this.overlay = item.overlay;
  }

  updateZoom()
  {
    // Snap if close enough
    if (this.currentZoom == this.targetZoom)
      return;
    if (Math.abs(this.currentZoom - this.targetZoom) < 0.1)
      this.changeZoom(this.targetZoom - this.currentZoom, this.lastZoomCenter);
    else
      this.changeZoom((this.targetZoom - this.currentZoom) / 10, this.lastZoomCenter);
  }

  resetSinWave() {
    this.sinWaveTime = 45;
  }

  updateAnimations(deltaTime: number) {
    this.updateSinWave(deltaTime);
    this.updateSpinner(deltaTime);

    this.observersToAnimationChange.map((observer) => { observer.animationChanged(); })
  }

  updateSinWave(deltaTime: number) {
    this.sinWaveTime += deltaTime / 3;
    if (this.sinWaveTime > 360) this.sinWaveTime -= 360;

    this.sinWave = Math.sin(this.sinWaveTime * Math.PI / 180) / 2 + 0.5;
  }

  updateSpinner(deltaTime: number) {
    this.spinner += deltaTime / 6;
    if (this.spinner > 360) this.spinner -= 360;
  }

  resetZoom(canvasSize: Vector2)
  {
    this.currentZoomIndex = 7;
    //this.currentZoomIndex = 13;
    this.targetZoom = this.currentZoom = this.zoomLevels[this.currentZoomIndex];

    this.cameraOffset.x = canvasSize.x * 0.5 / this.currentZoom;
    this.cameraOffset.y = canvasSize.y * 0.5 / this.currentZoom;
  }

    // Public because this is used by the export images dialog
    public zoomLevels: number[] = [16, 18, 20, 23, 27, 32, 38, 45, 54, 64, 76, 90, 108, 128]
    private currentZoomIndex: number
    zoom(delta: number, zoomCenter: Vector2)
    {
        this.lastZoomCenter = zoomCenter;
        this.currentZoomIndex += delta;
        if (this.currentZoomIndex < 0) this.currentZoomIndex = 0;
        if (this.currentZoomIndex >= this.zoomLevels.length) this.currentZoomIndex = this.zoomLevels.length - 1;

        this.targetZoom = this.zoomLevels[this.currentZoomIndex];
    }

    setHardZoom(zoomLevel: number) {
      this.targetZoom = this.currentZoom = zoomLevel;
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

export interface IObsCameraChanged {
  cameraChanged(camera: CameraService);
}

export interface IObsAnimationChanged {
  animationChanged();
}