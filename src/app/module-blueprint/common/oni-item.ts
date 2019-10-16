import { Vector2 } from "./vector2";
import { UtilityConnection, ConnectionType } from "./utility-connection";
import { OverlayType } from "./overlay-type";
import { BlueprintParams } from "./params";
import { DrawHelpers } from "../drawing/draw-helpers";
import { BBuilding } from "./bexport/b-building";
import { ImageSource } from "../drawing/image-source";
import { SpriteInfo } from "../drawing/sprite-info";
import { SpriteModifier } from "./sprite-modifier";
import { BSourceUv } from './bexport/b-source-uv';
import { BuildMenuCategory } from './bexport/b-build_order';

export class OniItem
{
  static elementId = 'Element';
  static defaultColor = '#696969';

  id: string;
  imageId: string;
  spriteInfoId: string;
  spriteModifierId: string;
  category: number;
  isWire: boolean;
  isTile: boolean;
  isElement: boolean;
  debugColor: string;
  size: Vector2;
  tileOffset: Vector2;
  utilityConnections: UtilityConnection[];
  defaultOverlay: OverlayType;
  defaultColor: string;
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
    this.defaultOverlay = original.sceneLayer;

    let imageId: string = original.textureName;

    // TODO refactor
    let imageUrl: string = 'assets/images/'+imageId+'.png';
    ImageSource.AddImagePixi(imageId, imageUrl);
    this.imageId = imageId;

    this.utilityConnections = [];
    if (original.utilities != null)
        for (let connection of original.utilities)
            this.utilityConnections.push({
              type:connection.type, 
              offset:new Vector2(connection.offset.x, connection.offset.y),
              isSecondary:connection.isSecondary
            });

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

        if (original.size != null && original.size.x != null) this.size = new Vector2(original.size.x, original.size.y);

        
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
        if (this.defaultOverlay == null) this.defaultOverlay = OverlayType.Building;
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

      fetch("/assets/database/exportC.json")
      .then(response => { return response.json(); })
      .then(json => {
        let oniItemsTemp: BBuilding[] = json.buildings;

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

        // TODO fix export
        let buildItems: any[] = json.buildMenuItems;
        for (let buildItem of buildItems)
        {
          OniItem.getOniItem(buildItem.buildingId).category = buildItem.category;
        }

        let buildMenuCategories: BuildMenuCategory[] = json.buildMenuCategories;
        for (let original of buildMenuCategories)
        {
          let newBuildMenuCategory = new BuildMenuCategory();
          newBuildMenuCategory.importFrom(original);

          BuildMenuCategory.buildMenuCategories.push(newBuildMenuCategory);
        }

        let uiSprites: BSourceUv[] = json.uiSprites;
        for (let uiSprite of uiSprites)
        {
          let newUiSpriteInfo = new SpriteInfo(uiSprite.name);
          newUiSpriteInfo.copyFromSourceUv(uiSprite);

          // TODO refactor
          let imageUrl: string = 'assets/images/'+newUiSpriteInfo.imageId+'.png';
          ImageSource.AddImagePixi(newUiSpriteInfo.imageId, imageUrl)
          
          SpriteInfo.addSpriteInfo(newUiSpriteInfo);
        }
        
        OniItem.loadedDatabase = true;  
        resolve(0);

      })
      .catch((error) => {

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