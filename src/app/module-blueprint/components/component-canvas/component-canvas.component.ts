// Angular imports
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, Output, EventEmitter, HostListener, Pipe } from '@angular/core';
//import { Http, Response } from "@angular/http"
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ComponentSidepanelComponent } from 'src/app/module-blueprint/components/side-bar/side-panel/side-panel.component';

// Engine imports
import { CameraService, IObsOverlayChanged } from 'src/app/module-blueprint/services/camera-service';
import { Vector2 } from 'src/app/module-blueprint/common/vector2';
import { SpriteInfo } from 'src/app/module-blueprint/drawing/sprite-info';
import { ImageSource } from 'src/app/module-blueprint/drawing/image-source';
import { OniTemplate } from 'src/app/module-blueprint/common/blueprint/io/oni/oni-template';
import { OniItem } from 'src/app/module-blueprint/common/oni-item';
import { OniBuilding } from 'src/app/module-blueprint/common/blueprint/io/oni/oni-building';
import { SpriteModifier } from 'src/app/module-blueprint/drawing/sprite-modifier';


// PrimeNg imports
import { TileInfo } from '../../common/tile-info';
import { Blueprint } from '../../common/blueprint/blueprint';
import { ZIndex, Overlay } from '../../common/overlay-type';
import { ToolType } from '../../common/tools/tool';
import { ComponentSideSelectionToolComponent } from '../side-bar/selection-tool/selection-tool.component';
import { DrawPixi } from '../../drawing/draw-pixi';
import * as JSZip from 'jszip';
import { BSpriteInfo } from '../../common/bexport/b-sprite-info';
import { BlueprintItem } from '../../common/blueprint/blueprint-item';
import { TechnicalRepack } from '../../common/technical-repack';
import { BlueprintService } from '../../services/blueprint-service';
import { ToolService } from '../../services/tool-service';
import { Container } from 'pixi.js';
import { read } from 'fs';
import { BinController } from '../../common/bin-packing/bin-controller';
import { IObsBuildItemChanged } from '../../common/tools/build-tool';


@Component({
  selector: 'app-component-canvas',
  templateUrl: './component-canvas.component.html',
  styleUrls: ['./component-canvas.component.css']
})
export class ComponentCanvasComponent implements OnInit, OnDestroy  {

  width: number;
  height: number;

  debug: any;


  @ViewChild('blueprintCanvas', {static: true}) 
  canvasRef: ElementRef;

  @ViewChild('divCalcHeight', {static: true})
  divCalcHeight: ElementRef;

  drawPixi: DrawPixi;
  technicalRepack: TechnicalRepack;

  public get blueprint() { return this.blueprintService.blueprint; }
  constructor(
    private ngZone: NgZone,
    private blueprintService: BlueprintService,
    private cameraService: CameraService,
    private toolService: ToolService) {
    
    this.drawPixi = new DrawPixi();

    this.technicalRepack = new TechnicalRepack();
  }

  private running: boolean;
  ngOnInit() {
    // Start the rendering loop
    this.running = true;
    this.ngZone.runOutsideAngular(() => {
      this.drawPixi.Init(this.canvasRef, this);
      this.drawPixi.InitAnimation();
      this.cameraService.container = this.drawPixi.pixiApp.stage;
    });

    //this.drawAbstraction.Init(this.canvasRef, this)
  }

  ngOnDestroy() {
    this.running = false;
  }

  public loadNewBlueprint(blueprint: Blueprint)
  {
    // First destroy the old blueprint
    if (this.blueprint != null) this.blueprint.destroy(); 

    // TODO make sure nothing creates a "real  blueprint" before this
    this.blueprint.importFromCloud(blueprint);
    this.cameraService.overlay = Overlay.Base; 

    let rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.cameraService.resetZoom(new Vector2(
      rect.width - rect.left,
      rect.height - rect.top
    ));
  }

  getCursorPosition(event): Vector2 {
    let rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return new Vector2(event.clientX - rect.left, event.clientY - rect.top);
  }

  getCurrentTile(event): Vector2
  {
    let returnValue = this.cameraService.getTileCoords(this.getCursorPosition(event));
    
    returnValue.x = Math.floor(returnValue.x);
    returnValue.y = Math.ceil(returnValue.y);

    return returnValue;
  }

  mouseWheel(event: any)
  {
    this.cameraService.zoom(event.delta, this.getCursorPosition(event));
  }

  mouseUp(event: any)
  {
    if (event.button == 0) 
    {
      this.storePreviousTileFloat = null;
    }
  }

  mouseDown(event: any)
  {
  
  }

  mouseOut(event: any) {
    this.toolService.mouseOut();
  }

  mouseClick(event: any)
  {
    if (event.button == 0) this.toolService.leftClick(this.getCurrentTile(event));
    else if (event.button == 2) this.toolService.rightClick(this.getCurrentTile(event));
  }

  storePreviousTileFloat: Vector2;
  mouseDrag(event: any)
  {
    let previousTileFloat = Vector2.clone(this.storePreviousTileFloat);
    let currentTileFloat = this.cameraService.getTileCoords(this.getCursorPosition(event));

    if (event.dragButton[2])
    {
      //console.log('camera drag');
      this.cameraService.cameraOffset.x += event.dragX / this.cameraService.currentZoom;
      this.cameraService.cameraOffset.y += event.dragY / this.cameraService.currentZoom;
    }
    else if (event.dragButton[0])
    {
      this.toolService.drag(previousTileFloat, currentTileFloat);

    }

    this.storePreviousTileFloat = Vector2.clone(currentTileFloat);
  }

  mouseStopDrag(event: any)
  {
    this.storePreviousTileFloat = null;
    this.toolService.dragStop();
  }

  previousTileUnderMouse: Vector2;
  mouseMove(event: any)
  {
    
    let currentTileUnderMouse = this.getCurrentTile(event);

    if (this.previousTileUnderMouse == null || !this.previousTileUnderMouse.equals(currentTileUnderMouse))
      this.toolService.hover(currentTileUnderMouse);

    this.previousTileUnderMouse = currentTileUnderMouse;
    
  }


  keyPress(event: any)
  {
    this.toolService.keyDown(event.key)
  }

  prepareOverlayInfo()
  {
    if (this.blueprint != null) this.blueprint.prepareOverlayInfo(this.cameraService.overlay);
  }

  /*
   * 
   * Sprite repackaging 
   *
  */
  fetchIcons()
  {
    for (let k of ImageSource.keys) ImageSource.getBaseTexture(k);
    for (let k of SpriteInfo.keys) SpriteInfo.getSpriteInfo(k).getTexture();
  }

  downloadUtility()
  {
    let allWhiteFilter = new PIXI.filters.ColorMatrixFilter();
    // 1 1 1 0 1
    // 1 1 1 0 1
    // 1 1 1 0 1
    // 1 1 1 1 1
    allWhiteFilter.matrix[0] = 1;
    allWhiteFilter.matrix[1] = 1;
    allWhiteFilter.matrix[2] = 1;
    allWhiteFilter.matrix[4] = 1;
    allWhiteFilter.matrix[5] = 1;
    allWhiteFilter.matrix[6] = 1;
    allWhiteFilter.matrix[7] = 1;
    allWhiteFilter.matrix[9] = 1;
    allWhiteFilter.matrix[10] = 1;
    allWhiteFilter.matrix[11] = 1;
    allWhiteFilter.matrix[12] = 1;
    allWhiteFilter.matrix[14] = 1;

    ComponentCanvasComponent.zip = new JSZip();
    ComponentCanvasComponent.nbBlob = 0;
    ComponentCanvasComponent.downloadFile = 'solidUtility.zip';
    ComponentCanvasComponent.nbBlobMax = OniItem.oniItems.filter(o => o.isWire).length;
    
    for (let oniItem of OniItem.oniItems)
    {
      // TODO bridge here also
      if (!oniItem.isWire) continue;

      let baseTexture = ImageSource.getBaseTexture(oniItem.imageId);
      
      let texture = new PIXI.Texture(baseTexture);
      
      let brt = new PIXI.BaseRenderTexture({width: texture.width, height: texture.height});
      let rt = new PIXI.RenderTexture(brt);

      let sprite = PIXI.Sprite.from(texture);
      sprite.filters = [allWhiteFilter];

      this.drawPixi.pixiApp.renderer.render(sprite, rt);

      this.drawPixi.pixiApp.renderer.extract.canvas(rt).toBlob((b) => 
      {
        this.addBlob(b, oniItem.imageId + '_solid.png');
      }, 'image/png');
    }
  }

  repackTextures(database: any)
  {
    // Tests bintrays
    let traySize = 1024;
    let textureBaseString = 'repack_';
    let binController = new BinController(new Vector2(traySize, traySize));

    let bleed = new Vector2(10, 10);
    /*
    // Tests
    binController.addItem('test_0', new Vector2(50, 50), bleed);
    binController.addItem('test_1', new Vector2(50, 50), bleed);
    binController.addItem('test_2', new Vector2(10, 50), bleed);
    binController.addItem('test_3', new Vector2(10, 50), bleed);
    */

    // First, we clone the existing spriteInfos into a new array :
    let newSpriteInfos: BSpriteInfo[] = [];

    for (let spriteInfo of SpriteInfo.spriteInfos) {
      // Copy the sprite info into the BSpriteInfo.
      // We need to start from the start info because some of them are generated (tiles)
      let newSpriteInfo = new BSpriteInfo();
      newSpriteInfo.name = spriteInfo.spriteInfoId;
      newSpriteInfo.uvMin = Vector2.clone(spriteInfo.uvMin);
      newSpriteInfo.uvSize = Vector2.clone(spriteInfo.uvSize);
      newSpriteInfo.realSize = Vector2.clone(spriteInfo.realSize);
      newSpriteInfo.pivot = Vector2.clone(spriteInfo.pivot);
      newSpriteInfo.isIcon = spriteInfo.isIcon;
      newSpriteInfos.push(newSpriteInfo);
    }

    // Sort our new array of BSpriteInfo by descending height
    newSpriteInfos = newSpriteInfos.sort((i1, i2) => { return i2.uvSize.y - i1.uvSize.y; });

    for (let spriteInfo of newSpriteInfos) {
      let itemAdded  = binController.addItem(spriteInfo.name, Vector2.clone(spriteInfo.uvSize), bleed);
      if (itemAdded != null) {
        spriteInfo.uvMin = Vector2.clone(itemAdded.uvStart);
        spriteInfo.textureName = textureBaseString + itemAdded.trayIndex;
      }
    }

    
    database.uiSprites = newSpriteInfos;

    ComponentCanvasComponent.zip = new JSZip();
    ComponentCanvasComponent.nbBlob = 0;
    ComponentCanvasComponent.downloadFile = 'repackedTextureAndDatabase.zip';
    ComponentCanvasComponent.nbBlobMax = binController.binTrays.length;

    ComponentCanvasComponent.zip.file('database_repacked.json', JSON.stringify(database, null, 2));


    for (let trayIndex = 0; trayIndex < binController.binTrays.length; trayIndex++) {
      let brt = new PIXI.BaseRenderTexture({width: binController.binTrays[trayIndex].binSize.x, height: binController.binTrays[trayIndex].binSize.y});
      let rt = new PIXI.RenderTexture(brt);

      let graphics = new PIXI.Graphics();
      let container = new Container();
      container.addChild(graphics);

      for (let spriteInfo of newSpriteInfos.filter((s) => { return s.textureName == textureBaseString + trayIndex; })) {
        let sprite = PIXI.Sprite.from(SpriteInfo.getSpriteInfo(spriteInfo.name).getTexture());

        sprite.x = spriteInfo.uvMin.x;
        sprite.y = spriteInfo.uvMin.y;
        container.addChild(sprite);

        //graphics.beginFill(0x007AD9);
        //graphics.drawRect(spriteInfo.uvMin.x, spriteInfo.uvMin.y, spriteInfo.uvSize.x, spriteInfo.uvSize.y);
        //graphics.endFill();
      }

      this.drawPixi.pixiApp.renderer.render(container, rt, true);

      this.drawPixi.pixiApp.renderer.extract.canvas(rt).toBlob((b) => 
      {
        this.addBlob(b, textureBaseString + trayIndex + '.png');
      }, 'image/png');
    }
  }
  
  downloadIcons()
  {
    
    ComponentCanvasComponent.zip = new JSZip();
    ComponentCanvasComponent.nbBlob = 0;
    ComponentCanvasComponent.downloadFile = 'icons.zip';
    ComponentCanvasComponent.nbBlobMax = SpriteInfo.keys.filter(s => SpriteInfo.getSpriteInfo(s).isIcon).length;
    
    for (let k of SpriteInfo.keys.filter(s => SpriteInfo.getSpriteInfo(s).isIcon))
    {
      let uiSpriteInfo = SpriteInfo.getSpriteInfo(k);
      let texture = uiSpriteInfo.getTexture();
      let uiSPrite = PIXI.Sprite.from(texture);

      this.drawPixi.pixiApp.renderer.extract.canvas(uiSPrite).toBlob((b) => 
      {
        this.addBlob(b, k + '.png');
      }, 'image/png');
    }
  }

  private static downloadFile: string;
  private static nbBlobMax: number;
  private static nbBlob: number;
  private static zip: JSZip;
  addBlob(blob: Blob, filename: string)
  {

    ComponentCanvasComponent.nbBlob++;
    ComponentCanvasComponent.zip.file(filename, blob);

    if (ComponentCanvasComponent.nbBlob == ComponentCanvasComponent.nbBlobMax)
    {
      console.log('last blob arrived!');
      ComponentCanvasComponent.zip.generateAsync({type:"blob"}).then(function (blob) { 
        let a = document.createElement('a');
        document.body.append(a);
        a.download = ComponentCanvasComponent.downloadFile;
        a.href = URL.createObjectURL(blob);
        a.click();
        a.remove();                     
      }); 
    }
  }

  exportImages() {

    let clone = this.blueprint.clone();
    if (clone.blueprintItems.length == 0) throw new Error('No buildings to export')

    // TODO error checking?
    let topLeft = new Vector2(9999, 9999);
    let bottomRight = new Vector2(-9999, -9999);

    clone.blueprintItems.map((item) => { 
      item.cleanUp();

      // TODO big item topleft here
      if (topLeft.x > item.position.x) topLeft.x = item.position.x;
      if (topLeft.y > item.position.y) topLeft.y = item.position.y;
      if (bottomRight.x < item.position.x) bottomRight.x = item.position.x;
      if (bottomRight.y < item.position.y) bottomRight.y = item.position.y;
    });

    let tileSize = 64;
    let totalTileSize = new Vector2(bottomRight.x - topLeft.x + 3, bottomRight.y - topLeft.y + 3);
    
    // Save real size
    //this.saveImage(clone, new Vector2(totalTileSize.x * tileSize, totalTileSize.y * tileSize), tileSize, new Vector2(-topLeft.x - 1, bottomRight.y + 1));

    let thumbnailSize = 500;
    let maxTotalSize = Math.max(totalTileSize.x, totalTileSize.y);
    let thumbnailTileSize = thumbnailSize / maxTotalSize;
    let cameraOffset = new Vector2(-topLeft.x + 1, bottomRight.y + 1);
    if (totalTileSize.x > totalTileSize.y) cameraOffset.y += totalTileSize.x / 2 - totalTileSize.y / 2;
    if (totalTileSize.y > totalTileSize.x) cameraOffset.x += totalTileSize.y / 2 - totalTileSize.x / 2;
    
    this.saveImage(clone, new Vector2(thumbnailSize, thumbnailSize), thumbnailTileSize, cameraOffset);
  }

  updateThumbnail() {

    this.blueprintService.thumbnail = null;


    let clone = this.blueprint.clone();
    if (clone.blueprintItems.length == 0) throw new Error('No buildings to export')

    let boundingBox = clone.getBoundingBox();
    let topLeft = boundingBox[0];
    let bottomRight = boundingBox[1];

    let totalTileSize = new Vector2(bottomRight.x - topLeft.x + 3, bottomRight.y - topLeft.y + 3);
    
    let thumbnailSize = 200;
    let maxTotalSize = Math.max(totalTileSize.x, totalTileSize.y);
    let thumbnailTileSize = thumbnailSize / maxTotalSize;
    let cameraOffset = new Vector2(-topLeft.x + 1, bottomRight.y + 1);
    if (totalTileSize.x > totalTileSize.y) cameraOffset.y += totalTileSize.x / 2 - totalTileSize.y / 2;
    if (totalTileSize.y > totalTileSize.x) cameraOffset.x += totalTileSize.y / 2 - totalTileSize.x / 2;
    
    let exportCamera = new CameraService();
    exportCamera.setHardZoom(thumbnailTileSize);
    exportCamera.cameraOffset = cameraOffset;
    exportCamera.overlay = Overlay.Base;
    exportCamera.container = new Container();

    let graphics = new PIXI.Graphics();
    exportCamera.container.addChild(graphics);

    // TODO color in parameter
    graphics.beginFill(0x007AD9);
    graphics.drawRect(0, 0, thumbnailSize, thumbnailSize);
    graphics.endFill();

    clone.blueprintItems.map((item) => { 
      item.prepareOverlayInfo(exportCamera.overlay);
      item.prepareSpriteInfoModifier(clone);
      item.drawPixi(exportCamera, this.drawPixi);
    });

    let brt = new PIXI.BaseRenderTexture({width: thumbnailSize, height: thumbnailSize, scaleMode: PIXI.SCALE_MODES.LINEAR});
    let rt = new PIXI.RenderTexture(brt);

    this.drawPixi.pixiApp.renderer.render(exportCamera.container, rt, false);
    this.drawPixi.pixiApp.renderer.extract.canvas(rt).toBlob((blob) => { 
      let reader = new FileReader();
      reader.onload = () => { this.blueprintService.thumbnail = reader.result as string; };
      reader.readAsDataURL(blob);

      /*
      // Test download
      let a = document.createElement('a');
        document.body.append(a);
        a.download = ComponentCanvasComponent.downloadFile;
        a.href = URL.createObjectURL(blob);
        a.click();
        a.remove();
      */
    }); 
  }

  saveImage(clone: Blueprint, sizeInPixels: Vector2, tileSizeInPixels: number, cameraOffset: Vector2) {

    console.log(sizeInPixels);
    console.log(tileSizeInPixels);
    console.log(cameraOffset);

    let exportCamera = new CameraService();
    exportCamera.setHardZoom(tileSizeInPixels);
    exportCamera.cameraOffset = cameraOffset;
    exportCamera.overlay = Overlay.Base;
    exportCamera.container = new Container();

    clone.blueprintItems.map((item) => { 
      item.prepareOverlayInfo(exportCamera.overlay);
      item.prepareSpriteInfoModifier(clone);
      item.drawPixi(exportCamera, this.drawPixi);
    });

    let brt = new PIXI.BaseRenderTexture({width: sizeInPixels.x, height: sizeInPixels.y, scaleMode: PIXI.SCALE_MODES.LINEAR});
    let rt = new PIXI.RenderTexture(brt);

    this.drawPixi.pixiApp.renderer.render(exportCamera.container, rt, false);

    this.drawPixi.pixiApp.renderer.extract.canvas(rt).toBlob((blob) => { 
        let a = document.createElement('a');
        document.body.append(a);
        a.download = ComponentCanvasComponent.downloadFile;
        a.href = URL.createObjectURL(blob);
        a.click();
        a.remove();                     
      }); 
  }
  
  drawAll()
  {
    //console.log(this.running);
    //console.log('tick');
    // Check that we're still running.
    if (!this.running) {
      return;
    }


    // Whole page dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    //console.log('tick');
    // TODO ugly
    //if (this.canvasRef == null) return;

    //console.log(this.divCalcHeight.nativeElement.offsetHeight)
    this.canvasRef.nativeElement.width = window.innerWidth;
    //this.canvasRef.nativeElement.height = 500;
    this.canvasRef.nativeElement.height = window.innerHeight;
    //this.canvasRef.nativeElement.height = this.divCalcHeight.nativeElement.offsetHeight - 7;

    
    this.cameraService.updateZoom();

    //console.log('tick');
    //this.drawAbstraction.Init(this.canvasRef, this);

    //let ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');

    this.drawPixi.clearGraphics();
    this.drawPixi.FillRect(0x007AD9, 0, 0, this.width, this.height);
    
    let alphaOrig: number = 0.4;
    let alpha: number = alphaOrig;
    let realLineSpacing: number = this.cameraService.currentZoom;

    let zoomFadeMax: number = 35;
    let zoomFadeMin: number = 25;
    if (this.cameraService.currentZoom < zoomFadeMax)
      alpha *= (this.cameraService.currentZoom - zoomFadeMin) / (zoomFadeMax - zoomFadeMin);
    if (this.cameraService.currentZoom < zoomFadeMin)
      alpha = 0;


    //while (realLineSpacing < 30)
    //  realLineSpacing *= 5;

    let colOrig: number = this.cameraService.cameraOffset.x * this.cameraService.currentZoom % (realLineSpacing * 5) - realLineSpacing * 4;
    let mod = 0;
    for (let col = colOrig; col < this.width + realLineSpacing * 4; col += realLineSpacing)
    {
      let realAlpha = (mod % 5) == 0 ? alphaOrig + 0.3 : alpha;
      let color = 'rgba(255,255,255, '+realAlpha+')';
      if (realAlpha > 0) this.drawPixi.drawBlueprintLine(color, realAlpha, new Vector2(col, 0), new Vector2(col, this.height), 1);
      mod++;
    }

    let lineOrig = this.cameraService.cameraOffset.y * this.cameraService.currentZoom % (realLineSpacing * 5) - realLineSpacing * 4
    mod = 0;
    for (let line = lineOrig; line < this.height + realLineSpacing * 4; line += realLineSpacing)
    {
      let realAlpha = (mod % 5) == 0 ? alphaOrig + 0.3 : alpha;
      let color = 'rgba(255,255,255, '+realAlpha+')';
      if (realAlpha > 0) this.drawPixi.drawBlueprintLine(color, realAlpha, new Vector2(0, line), new Vector2(this.width, line), 1);
      mod++;
    }

    if (this.blueprint != null)
    {
      for (var templateItem of this.blueprint.blueprintItems)
      {
        templateItem.prepareSpriteInfoModifier(this.blueprint);
        this.drawPixi.drawTemplateItem(templateItem, this.cameraService);
        //templateItem.draw(ctx, this.camera);
      }
      
      this.toolService.draw(this.drawPixi, this.cameraService);
    }

    // Schedule next
    //requestAnimationFrame(() => this.drawAll());
  }
  
  animateAll() {
    this.cameraService.updateAnimations(this.drawPixi.pixiApp.ticker.elapsedMS);
  }

  drawBlueprintLine(ctx: CanvasRenderingContext2D, xStart: number, yStart: number, xEnd: number, yEnd: number, lineWidth: number, alpha: number)
  {
    let offset: number = (lineWidth % 2) / 2;

    ctx.beginPath();
    ctx.moveTo(Math.floor(xStart) + offset, Math.floor(yStart) + offset);
    ctx.strokeStyle = "rgba(255,255,255, "+alpha+")";
    ctx.lineWidth = lineWidth;
    ctx.lineTo(Math.floor(xEnd) + offset, Math.floor(yEnd) + offset);
    ctx.stroke();
  }

}
