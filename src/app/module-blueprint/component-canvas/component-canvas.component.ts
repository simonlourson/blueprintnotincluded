// Angular imports
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, Output, EventEmitter, HostListener } from '@angular/core';
//import { Http, Response } from "@angular/http"
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ComponentSidepanelComponent } from 'src/app/module-blueprint/component-side-panel/component-side-panel.component';

// Engine imports
import { Camera } from 'src/app/module-blueprint/common/camera';
import { Vector2 } from 'src/app/module-blueprint/common/vector2';
import { SpriteInfo } from 'src/app/module-blueprint/drawing/sprite-info';
import { ImageSource } from 'src/app/module-blueprint/drawing/image-source';
import { OniTemplate } from 'src/app/module-blueprint/oni-import/oni-template';
import { OniItem } from 'src/app/module-blueprint/common/oni-item';
import { OniBuilding } from 'src/app/module-blueprint/oni-import/oni-building';
import { SpriteModifier } from 'src/app/module-blueprint/drawing/sprite-modifier';


// PrimeNg imports
import { TileInfo } from '../common/tile-info';
import { Template } from '../common/template/template';
import { ZIndex, Overlay } from '../common/overlay-type';
import { Tool, ToolType } from '../common/tools/tool';
import { ToolRequest } from '../common/tool-request';
import { ComponentSideSelectionToolComponent } from '../component-side-selection-tool/component-side-selection-tool.component';
import { DrawAbstraction } from '../drawing/draw-abstraction';
import { DrawPixi } from '../drawing/draw-pixi';
import { ɵangular_packages_router_router_n } from '@angular/router';
import * as JSZip from 'jszip';
import { BSpriteInfo } from '../common/bexport/b-sprite-info';


@Component({
  selector: 'app-component-canvas',
  templateUrl: './component-canvas.component.html',
  styleUrls: ['./component-canvas.component.css']
})
export class ComponentCanvasComponent implements OnInit, OnDestroy  {

  camera: Camera

  width: number;
  height: number;

  debug: any;


  @ViewChild('blueprintCanvas', {static: true}) 
  canvasRef: ElementRef;

  @Output() onTileInfoChange = new EventEmitter<TileInfo>();
  @Output() onAskChangeTool = new EventEmitter<ToolRequest>();

  // Tools
  currentTool: Tool;

  drawAbstraction: DrawPixi;

  constructor(private ngZone: NgZone, private http: HttpClient) {
    
    this.camera = new Camera();
    this.drawAbstraction = new DrawPixi();
  }

  private running: boolean;
  ngOnInit() {
    // Start the rendering loop
    this.running = true;
    this.ngZone.runOutsideAngular(() => this.drawAbstraction.Init(this.canvasRef, this));

    //this.drawAbstraction.Init(this.canvasRef, this)
  }

  ngOnDestroy() {
    this.running = false;
  }

  public blueprint: Template;
  public loadNewBlueprint(blueprint: Template)
  {
    // First destroy the old blueprint
    if (this.blueprint != null) this.blueprint.destroy();

    this.blueprint = blueprint;
    this.changeOverlay(Overlay.Base);

    let rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.camera.resetZoom(new Vector2(
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
    let returnValue = this.camera.getTileCoords(this.getCursorPosition(event));
    
    returnValue.x = Math.floor(returnValue.x);
    returnValue.y = Math.ceil(returnValue.y);

    return returnValue;
  }

  mouseWheel(event: any)
  {
    this.camera.zoom(event.delta, this.getCursorPosition(event));
  }

  mouseUp(event: any)
  {
    if (event.button == 0) 
    {
      this.previousTileUnderMouseDrag = null;
      this.currentTool.leftMouseUp(this.blueprint, this.getCurrentTile(event));
    }
  }

  mouseDown(event: any)
  {
    if (event.button == 0) this.currentTool.leftMouseDown(this.blueprint, this.getCurrentTile(event));
  }

  mouseClick(event: any)
  {
    if (event.button == 0) this.currentTool.leftClick(this.blueprint, this.getCurrentTile(event));
    if (event.button == 2) this.currentTool.rightClick(this.blueprint, this.getCurrentTile(event));
  }

  previousTileUnderMouseDrag: Vector2;
  mouseDrag(event: any)
  {
    let currentTileUnderMouseDrag = this.getCurrentTile(event);

    if (event.dragButton[2])
    {
      //console.log('camera drag');
      this.camera.cameraOffset.x += event.dragX / this.camera.currentZoom;
      this.camera.cameraOffset.y += event.dragY / this.camera.currentZoom;
    }
    else if (event.dragButton[0])
    {
      // TODO capture mouse up events to stop the drag
      if (this.previousTileUnderMouseDrag != null && !this.previousTileUnderMouseDrag.equals(currentTileUnderMouseDrag))
        this.currentTool.changeTileDrag(this.blueprint, this.previousTileUnderMouseDrag, currentTileUnderMouseDrag);
    }

    this.previousTileUnderMouseDrag = currentTileUnderMouseDrag;
  }

  previousTileUnderMouse: Vector2;
  mouseMove(event: any)
  {
    
    let currentTileUnderMouse = this.getCurrentTile(event);

    if (this.previousTileUnderMouse == null || !this.previousTileUnderMouse.equals(currentTileUnderMouse))
      this.currentTool.changeTile(this.blueprint, this.previousTileUnderMouse, currentTileUnderMouse);

    this.previousTileUnderMouse = currentTileUnderMouse;
  }


  keyPress(event: any)
  {
    console.log(event);
  }

  changeOverlay(newOverlay: Overlay)
  {
    this.camera.overlay = newOverlay;
    this.prepareOverlayInfo();
  }

  prepareOverlayInfo()
  {
    if (this.blueprint != null) this.blueprint.prepareOverlayInfo(this.camera.overlay);
  }

  changeTool(newToolComponent: Tool)
  {
    // First deactivate the old tool
    if (this.currentTool != null) this.currentTool.destroyTool();

    this.currentTool = newToolComponent;
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
      if (!oniItem.isWire) continue;

      let baseTexture = ImageSource.getBaseTexture(oniItem.imageId);
      
      let texture = new PIXI.Texture(baseTexture);
      
      let brt = new PIXI.BaseRenderTexture({width: texture.width, height: texture.height});
      let rt = new PIXI.RenderTexture(brt);

      let sprite = PIXI.Sprite.from(texture);
      sprite.filters = [allWhiteFilter];

      this.drawAbstraction.pixiApp.renderer.render(sprite, rt);

      this.drawAbstraction.pixiApp.renderer.extract.canvas(rt).toBlob((b) => 
      {
        this.addBlob(b, oniItem.imageId + '_solid.png');
      }, 'image/png');
    }
  }

  repackTextures(database: any)
  {
    let uiSprites: BSpriteInfo[] = database.uiSprites;
    let newSpriteInfos: BSpriteInfo[] = [];


    let packSize = new Vector2(1024, 1024);
    let bleedSize: number = 10;
    let repackIndex = -1;
    let currentUv = Vector2.clone(Vector2.Zero);
    let currentLineHeight = 0;
    let baseString = 'repack_';
    let currentTextureName = baseString + repackIndex;
    let renderTextures: PIXI.RenderTexture[] = [];
    let newRenderTarget: boolean = true;
    for (let k of SpriteInfo.keys)
    {
      let spriteInfo = SpriteInfo.getSpriteInfo(k);
      
      // First copy the sprite info into the BSpriteInfo.
      // We need to start from the start info because some of them are generated (tiles)
      let newSpriteInfo = new BSpriteInfo();
      newSpriteInfo.name = spriteInfo.spriteInfoId;
      newSpriteInfo.uvMin = Vector2.clone(spriteInfo.uvMin);
      newSpriteInfo.uvSize = Vector2.clone(spriteInfo.uvSize);
      newSpriteInfo.realSize = Vector2.clone(spriteInfo.realSize);
      newSpriteInfo.pivot = Vector2.clone(spriteInfo.pivot);
      newSpriteInfo.isIcon = spriteInfo.isIcon;

      // If the sprite does not enter at all in our pack, log it and move on
      if (newSpriteInfo.uvSize.x > packSize.x || newSpriteInfo.uvSize.y > packSize.y)
      {
        console.log(newSpriteInfo.name + ' does not fit');
        console.log(newSpriteInfo);

        continue;
      }

      
      newSpriteInfos.push(newSpriteInfo);

      let fitHeight = (currentUv.y + newSpriteInfo.uvSize.y) <= packSize.y;
      let fitWidth = (currentUv.x + newSpriteInfo.uvSize.x) <= packSize.x;

      
      // If there is no vertical space, we start a new texture
      if (!fitHeight) newRenderTarget = true;

      // If there is no horizontal space, we start a new line
      if (!fitWidth)
      {
        // Add one pixel vertically to account for mipmapping
        currentUv.x = 0;
        currentUv.y += Math.ceil(currentLineHeight) + bleedSize;
        currentLineHeight = 0;

        // And now we have to check for height again
        fitHeight = (currentUv.y + newSpriteInfo.uvSize.y) <= packSize.y;
        if (!fitHeight) newRenderTarget = true;
      }

      if (newRenderTarget)
      {
        newRenderTarget = false;
        currentUv = Vector2.zero();
        repackIndex++;
        currentTextureName = baseString + repackIndex;

        // Create new renderTarget if currentUv = 0
        // Save the previous renderTarget
        let brt = new PIXI.BaseRenderTexture({width: packSize.x, height: packSize.y});
        let rt = new PIXI.RenderTexture(brt);
        //console.log(rt);
        renderTextures.push(rt);
        //console.log(renderTextures);
        //console.log('creating render target ' + currentTextureName)
        //console.log(renderTextures.length)
      }
      

      // Change the textureName to the repacked texture
      newSpriteInfo.textureName = currentTextureName;

      // Change the uvMin in the newSpriteInfo
      newSpriteInfo.uvMin = Vector2.clone(currentUv);

      // Add the sprite width +1 to account for mipmaps
      currentUv.x += Math.ceil(newSpriteInfo.uvSize.x) + bleedSize;
      
      // Update the current line height, if it is taller than the other sprites in this line
      if (newSpriteInfo.uvSize.y > currentLineHeight) currentLineHeight = newSpriteInfo.uvSize.y;

      // Draw the sprite to the renderTarget
      let sprite = PIXI.Sprite.from(SpriteInfo.getSpriteInfo(newSpriteInfo.name).getTexture());

      sprite.x = newSpriteInfo.uvMin.x;
      sprite.y = newSpriteInfo.uvMin.y;
      //console.log('drawing ' + newSpriteInfo.name + ' on render target ' + repackIndex);
      //console.log(newSpriteInfo.uvMin);
      this.drawAbstraction.pixiApp.renderer.render(sprite, renderTextures[repackIndex], false);
    }

    database.uiSprites = newSpriteInfos;

    ComponentCanvasComponent.zip = new JSZip();
    ComponentCanvasComponent.nbBlob = 0;
    ComponentCanvasComponent.downloadFile = 'repackedTextureAndDatabase.zip';
    ComponentCanvasComponent.nbBlobMax = renderTextures.length;

    ComponentCanvasComponent.zip.file('database_repacked.json', JSON.stringify(database, null, 2));

    for (let indexRt = 0; indexRt < renderTextures.length; indexRt++)
    {
      let rt = renderTextures[indexRt];

      this.drawAbstraction.pixiApp.renderer.extract.canvas(rt).toBlob((b) => 
      {
        this.addBlob(b, baseString + indexRt + '.png');
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

      this.drawAbstraction.pixiApp.renderer.extract.canvas(uiSPrite).toBlob((b) => 
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

    this.canvasRef.nativeElement.width = window.innerWidth - 301;
    this.canvasRef.nativeElement.height = window.innerHeight;

    
    this.camera.updateZoom();

    //console.log('tick');
    //this.drawAbstraction.Init(this.canvasRef, this);

    //let ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');

    this.drawAbstraction.clearGraphics();
    this.drawAbstraction.FillRect(0x007AD9, 0, 0, this.width, this.height);
    
    let alphaOrig: number = 0.4;
    let alpha: number = alphaOrig;
    let realLineSpacing: number = this.camera.currentZoom;

    let zoomFadeMax: number = 35;
    let zoomFadeMin: number = 25;
    if (this.camera.currentZoom < zoomFadeMax)
      alpha *= (this.camera.currentZoom - zoomFadeMin) / (zoomFadeMax - zoomFadeMin);
    if (this.camera.currentZoom < zoomFadeMin)
      alpha = 0;


    //while (realLineSpacing < 30)
    //  realLineSpacing *= 5;

    let colOrig: number = this.camera.cameraOffset.x * this.camera.currentZoom % (realLineSpacing * 5) - realLineSpacing * 4;
    let mod = 0;
    for (let col = colOrig; col < this.width + realLineSpacing * 4; col += realLineSpacing)
    {
      let realAlpha = (mod % 5) == 0 ? alphaOrig + 0.3 : alpha;
      let color = 'rgba(255,255,255, '+realAlpha+')';
      if (realAlpha > 0) this.drawAbstraction.drawBlueprintLine(color, realAlpha, new Vector2(col, 0), new Vector2(col, this.height), 1);
      mod++;
    }

    let lineOrig = this.camera.cameraOffset.y * this.camera.currentZoom % (realLineSpacing * 5) - realLineSpacing * 4
    mod = 0;
    for (let line = lineOrig; line < this.height + realLineSpacing * 4; line += realLineSpacing)
    {
      let realAlpha = (mod % 5) == 0 ? alphaOrig + 0.3 : alpha;
      let color = 'rgba(255,255,255, '+realAlpha+')';
      if (realAlpha > 0) this.drawAbstraction.drawBlueprintLine(color, realAlpha, new Vector2(0, line), new Vector2(this.width, line), 1);
      mod++;
    }

    if (this.blueprint != null)
    {
      for (var templateItem of this.blueprint.templateItems)
      {
        templateItem.prepareSpriteInfoModifier(this.blueprint);
        this.drawAbstraction.drawTemplateItem(templateItem, this.camera);
        //templateItem.draw(ctx, this.camera);
      }

      // TODO draw utility
      //for (var templateItem of this.blueprint.templateItems) templateItem.drawUtility(ctx, this.camera);

      this.currentTool.prepareSpriteInfoModifier(this.blueprint);
      this.currentTool.draw(this.drawAbstraction, this.camera);
    }

    // Schedule next
    //requestAnimationFrame(() => this.drawAll());
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
