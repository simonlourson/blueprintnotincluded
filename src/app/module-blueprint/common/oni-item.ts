import { Vector2 } from "./vector2";
import { UtilityConnection, ConnectionType } from "./utility-connection";
import { OverlayType } from "./overlay-type";
import { BlueprintParams } from "./params";
import { BuildCategories } from "./build-categories"
import { DrawHelpers } from "../drawing/draw-helpers";
import { BBuilding } from "./bexport/b-building";
import { ImageSource } from "./image-source";
import { SpriteInfo } from "./sprite-info";
import { SpriteModifier } from "./sprite-modifier";

export class OniItem
{
  static elementId = 'Element';
  static defaultColor = '#696969';

  id: string;
  imageId: string;
  spriteInfoId: string;
  spriteModifierId: string;
  isWire: boolean;
  isTile: boolean;
  isElement: boolean;
  debugColor: string;
  size: Vector2;
  tileOffset: Vector2;
  utilityConnections: UtilityConnection[];
  defaultOverlay: OverlayType;
  defaultColor: string;
  category: BuildCategories;
  orientations: AuthorizedOrientations[];


  constructor(id: string)
  {
    this.id = id;
    this.cleanUp();
  }

  public copyFromC(original: BBuilding)
  {
    this.id = original.prefabId;
    this.size = original.sizeInCells;
    this.isWire = original.isUtility;

    this.spriteModifierId = original.kanimPrefix;

    let imageId: string = original.textureName;
    let imageUrl: string = 'assets/images/'+imageId+'.png';
    ImageSource.AddImage(imageId, imageUrl);
    ImageSource.AddImagePixi(imageId, imageUrl);
    this.imageId = imageId;
  }

    public copyFrom(original: OniItem)
    {
        this.imageId = original.imageId;
        this.spriteInfoId = original.spriteInfoId;
        this.spriteModifierId = original.spriteModifierId;
        this.isWire = original.isWire;
        this.isTile = original.isTile;
        this.isElement = original.isElement;
        this.debugColor = original.debugColor;
        this.defaultOverlay = original.defaultOverlay;
        this.defaultColor = original.defaultColor;
        this.category = original.category;

        if (original.size != null && original.size.x != null) this.size = new Vector2(original.size.x, original.size.y);

        this.utilityConnections = [];
        if (original.utilityConnections != null && original.utilityConnections.length != 0)
            for (let connection of original.utilityConnections)
                this.utilityConnections.push({
                    connectionType:connection.connectionType, 
                    connectionOffset:new Vector2(connection.connectionOffset.x, connection.connectionOffset.y)});

        
        this.orientations = [AuthorizedOrientations.None];
        if (original.orientations != null && original.orientations.length != 0)
          for (let authorizedOrientation of original.orientations)
            this.orientations.push(authorizedOrientation);
        this.orientations.sort();
    }

    public cleanUp()
    {
        if (this.isTile == null) this.isTile = false;
        if (this.isWire == null) this.isWire = false;
        if (this.isElement == null) this.isElement = false;
        if (this.debugColor == null ) this.debugColor = 'rgba(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 50) + ',0.5)';
        if (this.size == null) this.size = new Vector2();
        if (this.utilityConnections == null) this.utilityConnections = [];
        if (this.defaultOverlay == null) this.defaultOverlay = OverlayType.buildings;
        if (this.category == null) this.category = BuildCategories.Other;
        if (this.orientations == null) this.orientations = [AuthorizedOrientations.None];
        
        // TODO not every item needs a color
        if (this.defaultColor == null) 
        {
          if (this.isElement) this.setRandomColor();
          else this.defaultColor = OniItem.defaultColor;
        }

        if (Vector2.Zero.equals(this.size)) this.tileOffset = Vector2.Zero;
        else
        {
            this.tileOffset = new Vector2(
                1 - (this.size.x + (this.size.x % 2)) / 2,
                0
            );
        }

        
        //if (this.tileOffset == null) this.tileOffset = Vector2.Zero;
    }

  setRandomColor()
  {
    this.defaultColor = DrawHelpers.getRandomColor();
  }

  public static loadedDatabase = false;
  public static oniItemsMap: Map<string, OniItem>;
  public static get oniItems() { return Array.from(OniItem.oniItemsMap.values()); }
  public static Init()
  {
    let promise = new Promise((resolve, reject) => {

      OniItem.oniItemsMap = new Map<string, OniItem>();


      /*
      fetch(BlueprintParams.apiUrl+'oniItems')
      //fetch("/assets/database/oniItems.json")
      .then(response => { return response.json(); })
      .then(json => {
        //console.log(json);
        let oniItemsTemp: OniItem[] = json;
        
        for (let oniItemTemp of oniItemsTemp)
        {
            
            let oniItem = new OniItem(oniItemTemp.id);
            oniItem.copyFrom(oniItemTemp);
            oniItem.cleanUp();
            
            OniItem.oniItemsMap.set(oniItem.id, oniItem);
        }

        OniItem.loadedDatabase = true;  
        resolve(0);
      })
      .catch((error) => {
        OniItem.loadedDatabase = true; 
        reject(error);
      })

      */

      fetch("/assets/database/exportC.json")
      .then(response => { return response.json(); })
      .then(json => {
        let oniItemsTemp: BBuilding[] = json;

        for (let oniItemTemp of oniItemsTemp)
        {

            let oniItem = new OniItem(oniItemTemp.prefabId);
            oniItem.copyFromC(oniItemTemp);
            oniItem.cleanUp();

            // TODO spriteInfoId is not used anymore
            SpriteInfo.AddSpriteInfo(oniItemTemp);
            SpriteModifier.AddSpriteModifier(oniItemTemp);
            
            OniItem.oniItemsMap.set(oniItem.id, oniItem);
        }
        
        ImageSource.FinishAddImage();
        SpriteInfo.FinishAddSpriteInfo();
        OniItem.loadedDatabase = true;  
        resolve(0);

      })
      .catch((error) => {

        ImageSource.FinishAddImage();
        SpriteInfo.FinishAddSpriteInfo();
        OniItem.loadedDatabase = true; 
        reject(error);
      })

    });

    return promise;
  }

  public static getOniItem(id: string): OniItem
  {
    let returnValue = OniItem.oniItemsMap.get(id);
    if (returnValue == null) 
    {
      returnValue = new OniItem(id);
      returnValue.cleanUp();
      
      // If the database is already loaded, but we still didn't find the item, we can add it to the map
      if (OniItem.loadedDatabase) OniItem.oniItemsMap.set(id, returnValue);
    }

    return returnValue;
  }
}

/*
conductive wire : green power
wire : white power
insulated liquid pipe : green liquid output
liquid pipe : white liquid input
radiant liquid pipe : orange liquid
insulated gas pipe : green gas input
gas pipe : white gas input
radiant gas pipe : orange gas
*/

export enum AuthorizedOrientations
{
  None,
  FlipH,
  FlipV,
  R90,
  R180,
  R270
}