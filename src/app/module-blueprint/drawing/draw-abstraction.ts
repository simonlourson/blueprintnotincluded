import { ElementRef } from "@angular/core";
import { Vector2 } from "../common/vector2";
import { TemplateItem } from "../common/template/template-item";
import { Camera } from "../common/camera";
import { Tool } from "../common/tools/tool";
import { ComponentCanvasComponent } from "../component-canvas/component-canvas.component";

export interface DrawAbstraction
{
  Init(canvas: ElementRef, parent: ComponentCanvasComponent);
  FillRect(color: string, x: number, y: number, w: number, h: number);
  drawBlueprintLine(color: string, alpha: number, start: Vector2, end: Vector2, lineWidth: number);
  drawTemplateItem(templateItem: TemplateItem, camera: Camera);
  drawTool(tool: Tool, camera: Camera);

}