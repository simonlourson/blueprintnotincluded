import { ToolType } from "./tools/tool";
import { TemplateItem } from "./template/template-item";

export class ToolRequest
{
  toolType: ToolType;
  templateItem: TemplateItem;
}