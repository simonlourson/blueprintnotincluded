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
    public static Init()
    {
        ComposingElement.elements = [];
        let promise = new Promise((resolve, reject) => {

            /*
            fetch(BlueprintParams.apiUrl+'composingElements')
            .then(response => { return response.json() })
            .then(json => {
                
              let elementsTemp: ComposingElement[] = json;

              ComposingElement.elements = [];
              for (let elementTemp of elementsTemp) 
              {
                let newElement = new ComposingElement(elementTemp.elementId);
                newElement.color = elementTemp.color;
                //if (newElement.color == null) newElement.color = DrawHelpers.getRandomColor();
                ComposingElement.elements.push(newElement);
              }

              ComposingElement.elements.sort((a, b) => { return a.elementId < b.elementId ? -1 : 1; });
              resolve(0);
            })
            .catch(error => {
              reject(error);
            })
            */
        });

        return promise;
    }

  public static getElement(elementId: string): ComposingElement
  {
    // TODO create new, cleanup, etc
    for (let element of ComposingElement.elements) if (element.elementId == elementId) return element;
    return ComposingElement.unknownElement;
  }
}