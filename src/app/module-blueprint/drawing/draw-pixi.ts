import { DrawAbstraction } from "./draw-abstraction";
import { ElementRef } from "@angular/core";
import { ComponentCanvasComponent } from "../components/component-canvas/component-canvas.component";
import { TemplateItem } from "../common/template/template-item";
import { Camera } from "../common/camera";
import { Vector2 } from "../common/vector2";
import { SpriteInfo } from './sprite-info';
import { ComponentMenuComponent } from '../components/component-menu/component-menu.component';
declare var PIXI: any;

export class DrawPixi implements DrawAbstraction
{
  static instance: DrawPixi;

  pixiApp: PIXI.Application;
  backGraphics: PIXI.Graphics;
  frontGraphics: PIXI.Graphics;
  parent: ComponentCanvasComponent;
  
  Init(canvas: ElementRef, parent: ComponentCanvasComponent) 
  {

    DrawPixi.instance = this;

    this.parent = parent;

    

    
    
    let htmlCanvas: HTMLCanvasElement = canvas.nativeElement;
    let options: any = {};
    options.view =  htmlCanvas;
    options.width = canvas.nativeElement.width;
    options.height = canvas.nativeElement.height;
    options.autoResize = true;
    
    PIXI.utils.skipHello();
    this.pixiApp = new PIXI.Application(options);
    this.backGraphics = new PIXI.Graphics();
    this.backGraphics.zIndex = -100;
    this.frontGraphics = new PIXI.Graphics();
    this.frontGraphics.zIndex = 100;
    this.pixiApp.stage.addChild(this.backGraphics);
    this.pixiApp.stage.addChild(this.frontGraphics);
    this.pixiApp.stage.sortableChildren = true;
    this.pixiApp.ticker.add(() => {this.drawAll();});
  }    

  drawAll()
  {
    ComponentMenuComponent.debugFps = this.pixiApp.ticker.FPS;

    //console.log('drawAll');
    if (this.pixiApp != null) 
    {
      //if (this.pixiApp.renderer.width != this.parent.canvasRef.nativeElement.width ||
        //this.pixiApp.renderer.height != this.parent.canvasRef.nativeElement.height)
        this.pixiApp.renderer.resize(this.parent.canvasRef.nativeElement.width, this.parent.canvasRef.nativeElement.height);
      //console.log('resize');
      //return;
    }

    this.parent.drawAll();
  }

  clearGraphics()
  {
    this.backGraphics.clear();
    this.frontGraphics.clear();
  }
    
  FillRect(color: number, x: number, y: number, w: number, h: number) 
  {
    
    this.backGraphics.beginFill(color);
    this.backGraphics.drawRect(x, y, w, h);
    this.backGraphics.endFill();
    
  }

  // TODO abstract drawline
  drawBlueprintLine(color: string, alpha: number, start: Vector2, end: Vector2, lineWidth: number) {
      
    this.backGraphics.lineStyle(1, 0xFFFFFF, alpha);
    this.backGraphics.moveTo(start.x, start.y);
    this.backGraphics.lineTo(end.x, end.y);

  }
  drawTemplateItem(templateItem: TemplateItem, camera: Camera) {
    
    templateItem.drawPixi(camera, this);

  }

  drawBuild(toBuild: TemplateItem, camera: Camera) {
    toBuild.drawPixi(camera, this);
  }

  public drawTileRectangle(camera: Camera, topLeft: Vector2, bottomRight: Vector2, frontGraphics: boolean, borderWidth: number, fillColor: number, borderColor: number, fillAlpha: number, borderAlpha: number)
  {
    let rectanglePosition = new Vector2(
      (topLeft.x + camera.cameraOffset.x) * camera.currentZoom,
      (-topLeft.y + camera.cameraOffset.y) * camera.currentZoom
    );
    let rectangleSize = new Vector2(
      (bottomRight.x - topLeft.x) * camera.currentZoom,
      (topLeft.y - bottomRight.y) * camera.currentZoom
    );

    let graphics = frontGraphics ? this.frontGraphics : this.backGraphics

    graphics.beginFill(fillColor, fillAlpha);
    graphics.drawRect(rectanglePosition.x, rectanglePosition.y, rectangleSize.x, rectangleSize.y);
    graphics.endFill();

    if (borderWidth > 0)
    {
      graphics.lineStyle(borderWidth, borderColor, borderAlpha);
      graphics.moveTo(rectanglePosition.x, rectanglePosition.y);
      graphics.lineTo(rectanglePosition.x + rectangleSize.x, rectanglePosition.y);
      graphics.lineTo(rectanglePosition.x + rectangleSize.x, rectanglePosition.y + rectangleSize.y);
      graphics.lineTo(rectanglePosition.x, rectanglePosition.y + rectangleSize.y);
      graphics.lineTo(rectanglePosition.x, rectanglePosition.y);
    }
  }

    
}