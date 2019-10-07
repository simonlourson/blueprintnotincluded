import { DrawAbstraction } from "./draw-abstraction";
import { ElementRef } from "@angular/core";
import { Vector2 } from "../common/vector2";
import { TemplateItem } from "../common/template/template-item";
import { Camera } from "../common/camera";
import { Tool } from "../common/tools/tool";
import { ComponentCanvasComponent } from "../component-canvas/component-canvas.component";

export class DrawCanvas implements DrawAbstraction
{
    
  ctx: CanvasRenderingContext2D;

  Init(canvas: ElementRef, parent: ComponentCanvasComponent) {
    this.ctx = CanvasRenderingContext2D = canvas.nativeElement.getContext('2d');
    parent.drawAll();
  }

  FillRect(color: string, x: number, y: number, w: number, h: number) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  drawBlueprintLine(color: string, alpha: number, start: Vector2, end: Vector2, lineWidth: number) {
    let offset: number = (lineWidth % 2) / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(Math.floor(start.x) + offset, Math.floor(start.y) + offset);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineTo(Math.floor(end.x) + offset, Math.floor(end.y) + offset);
    this.ctx.stroke();
  }
    
  drawTemplateItem(templateItem: TemplateItem, camera: Camera) {
    templateItem.draw(this.ctx, camera);
  }

  drawTool(tool: Tool, camera: Camera) {
    tool.draw(this.ctx, camera);
  }
}