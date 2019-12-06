import { DrawHelpers } from '../../drawing/draw-helpers';

export class BuildableElement {

  // From export
  id: string;
  name: string;
  oreTags: string[];
  icon: string;
  buildMenuSort: number;

  // Generated
  iconUrl: string

  public importFrom(original: BuildableElement)
  {
    this.id = original.id;
    this.name = original.name;
    
    this.oreTags = [];
    if (original.oreTags != null)
      for (let s of original.oreTags)
      this.oreTags.push(s);

    this.icon = original.icon;
    this.iconUrl = DrawHelpers.createUrl(this.icon, true);

    this.buildMenuSort = original.buildMenuSort;
  }

  // static
  public static elements: BuildableElement[]
  public static init()
  {
    BuildableElement.elements = [];
  }

  public static load(originals: BuildableElement[])
  {
    for (let original of originals)
    {
      let newElement = new BuildableElement();
      newElement.importFrom(original);

      BuildableElement.elements.push(newElement);
    }
  }

  public static getElement(id: string): BuildableElement {
    for (let element of BuildableElement.elements)
      if (element.id == id)
        return element;

    return null;
  }

  public static getElementsFromTag(tag: string): BuildableElement[] {
    
    let returnValue: BuildableElement[] = []; 

    for (let element of BuildableElement.elements) 
      if (returnValue.indexOf(element) == -1 && (element.id == tag || element.oreTags.indexOf(tag) != -1) && element.oreTags.indexOf('BuildableAny') != -1 )
        returnValue.push(element);

    if (returnValue.length == 0) returnValue.push(BuildableElement.getElement('Unobtanium'))

    returnValue = returnValue.sort((i1, i2) => { return i1.buildMenuSort - i2.buildMenuSort; });
    return returnValue;
  }

  public static getElementsFromTags(tags: string[]): BuildableElement[][] {
    //console.log('getElementsFromTags')

    let returnValue: BuildableElement[][] = [];

    for (let indexTag = 0; indexTag < tags.length; indexTag++) {
      returnValue[indexTag] = [];
      returnValue[indexTag] = this.getElementsFromTag(tags[indexTag]);
    }

    //console.log(returnValue)
    
    return returnValue;
  }
}