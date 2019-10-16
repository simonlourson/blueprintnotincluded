import { BlueprintParams } from "./params";
import { DrawHelpers } from "../drawing/draw-helpers";

export class ComposingElement
{
    elementId: string;
    elementName: string;
    color: string;

    constructor(elementId: string)
    {
      this.elementId = elementId;
    }

    public static unknownElement = {elementId:'Unknown', elementName:'Unknown', color:'#696969'};
    public static elements: ComposingElement[];
    public static init()
    {
        ComposingElement.elements = [];
    }

  public static getElement(elementId: string): ComposingElement
  {
    // TODO create new, cleanup, etc
    for (let element of ComposingElement.elements) if (element.elementId == elementId) return element;
    return ComposingElement.unknownElement;
  }
}