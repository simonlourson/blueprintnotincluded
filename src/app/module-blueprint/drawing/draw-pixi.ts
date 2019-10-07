import { DrawAbstraction } from "./draw-abstraction";
import { ElementRef } from "@angular/core";
import { ComponentCanvasComponent } from "../component-canvas/component-canvas.component";
import { TemplateItem } from "../common/template/template-item";
import { Camera } from "../common/camera";
import { Vector2 } from "../common/vector2";
declare var PIXI: any;

export class DrawPixi implements DrawAbstraction
{

  static instance: DrawPixi;

  pixiApp: PIXI.Application;
  graphics: PIXI.Graphics;
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
    this.pixiApp = new PIXI.Application(options);
    this.graphics = new PIXI.Graphics();
    this.pixiApp.stage.addChild(this.graphics);
    this.pixiApp.ticker.add(() => {this.drawAll();});
    //this.pixiApp.ticker.start();
  }    

  drawAll()
  {
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
    
  FillRect(color: string, x: number, y: number, w: number, h: number) 
  {
    //console.log('FillRect');
    //if (this.graphics == null) return;
    
    this.graphics.clear();
    this.graphics.beginFill(0x007AD9);
    this.graphics.drawRect(x, y, w, h);
    this.graphics.endFill();
    
  }

    drawBlueprintLine(color: string, alpha: number, start: Vector2, end: Vector2, lineWidth: number) {
        
      this.graphics.lineStyle(1, 0xFFFFFF, alpha);
      this.graphics.moveTo(start.x, start.y);
      this.graphics.lineTo(end.x, end.y);

    }
    drawTemplateItem(templateItem: TemplateItem, camera: Camera) {
        //throw new Error("Method not implemented.");

      this.drawDebugRectangle(camera, templateItem.topLeft, templateItem.bottomRight, templateItem.oniItem.debugColor);
      templateItem.drawPixi(camera, this.pixiApp);
    
    }
    drawTool(tool: import("../common/tools/tool").Tool, camera: import("../common/camera").Camera) {
        //throw new Error("Method not implemented.");
    }

  public drawDebugRectangle(camera: Camera, topLeft: Vector2, bottomRight: Vector2, color: string)
  {
    let delta = 0.4;

    let rectanglePosition = new Vector2(
      (topLeft.x + delta + camera.cameraOffset.x) * camera.currentZoom,
      (-topLeft.y + delta + camera.cameraOffset.y) * camera.currentZoom
    );
    let rectangleSize = new Vector2(
      (bottomRight.x - topLeft.x + 1) * camera.currentZoom - 2*delta*camera.currentZoom,
      (topLeft.y - bottomRight.y + 1) * camera.currentZoom - 2*delta*camera.currentZoom
    );

    this.graphics.beginFill(0xFF0000, 0.5);
    this.graphics.drawRect(rectanglePosition.x, rectanglePosition.y, rectangleSize.x, rectangleSize.y);
    this.graphics.endFill();

    this.graphics.lineStyle(2, 0x00000, 0.5);
    this.graphics.moveTo(rectanglePosition.x, rectanglePosition.y);
    this.graphics.lineTo(rectanglePosition.x + rectangleSize.x, rectanglePosition.y);
    this.graphics.lineTo(rectanglePosition.x + rectangleSize.x, rectanglePosition.y + rectangleSize.y);
    this.graphics.lineTo(rectanglePosition.x, rectanglePosition.y + rectangleSize.y);
    this.graphics.lineTo(rectanglePosition.x, rectanglePosition.y);
  }

    
}