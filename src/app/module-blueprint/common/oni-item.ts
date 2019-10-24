import { Vector2 } from "./vector2";
import { UtilityConnection, ConnectionType } from "./utility-connection";
import { ZIndex, Overlay } from "./overlay-type";
import { BlueprintParams } from "./params";
import { DrawHelpers } from "../drawing/draw-helpers";
import { BBuilding } from "./bexport/b-building";
import { ImageSource } from "../drawing/image-source";
import { SpriteInfo } from "../drawing/sprite-info";
import { SpriteModifier } from "../drawing/sprite-modifier";
import { BSpriteInfo } from './bexport/b-sprite-info';

export class OniItem
{
  static elementId = 'Element';
  static defaultColor = '#696969';

  id: string;
  imageId: string;
  iconUrl: string;
  // TODO spriteInfoId is probably not used, the spritemodifierPart has it
  spriteInfoId: string;
  spriteModifierId: string;
  isWire: boolean;
  isTile: boolean;
  isElement: boolean;
  debugColor: string;
  size: Vector2;
  tileOffset: Vector2;
  utilityConnections: UtilityConnection[];
  defaultColor: string;
  backColor: number;
  frontColor: number;
  orientations: AuthorizedOrientations[];

  // Overlay
  zIndex: ZIndex;
  overlay: Overlay

  constructor(id: string)
  {
    this.id = id;
    this.cleanUp();
  }

  public copyFrom(original: BBuilding)
  {
    this.id = original.prefabId;
    this.size = original.sizeInCells;
    this.isWire = original.isUtility;
    this.isTile = original.isTile;

    this.spriteModifierId = original.kanimPrefix;
    this.iconUrl = DrawHelpers.createUrl(original.kanimPrefix + 'ui_0', true);
    this.zIndex = original.sceneLayer;
    this.overlay = this.getRealOverlay(original.viewMode);
    this.backColor = original.backColor;
    this.frontColor = original.frontColor;

    let imageId: string = original.textureName;

    // TODO refactor
    let imageUrl: string = DrawHelpers.createUrl(imageId, false);
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

  public getRealOverlay(overlay: Overlay)
  {
    let returnValue: Overlay = overlay;

    switch (overlay)
    {
      case Overlay.Decor:
      case Overlay.Light:
      case Overlay.Oxygen: 
      case Overlay.Room: 
      case Overlay.Temperature: 
      case Overlay.Unknown: returnValue = Overlay.Base;
    }

    return returnValue;
  }

  /*
    public copyFrom(original: OniItem)
    {
        this.imageId = original.imageId;
        this.spriteInfoId = original.spriteInfoId;
        this.spriteModifierId = original.spriteModifierId;
        this.isWire = original.isWire;
        this.isTile = original.isTile;
        this.isElement = original.isElement;
        this.debugColor = original.debugColor;
        this.zIndex = original.zIndex;
        this.defaultColor = original.defaultColor;

        if (original.size != null && original.size.x != null) this.size = new Vector2(original.size.x, original.size.y);

        
        this.orientations = [AuthorizedOrientations.None];
        if (original.orientations != null && original.orientations.length != 0)
          for (let authorizedOrientation of original.orientations)
            this.orientations.push(authorizedOrientation);
        this.orientations.sort();
    }
    */

    public cleanUp()
    {
        if (this.isTile == null) this.isTile = false;
        if (this.isWire == null) this.isWire = false;
        if (this.isElement == null) this.isElement = false;
        if (this.debugColor == null ) this.debugColor = 'rgba(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 50) + ',0.5)';
        if (this.size == null) this.size = new Vector2();
        if (this.utilityConnections == null) this.utilityConnections = [];
        if (this.zIndex == null) this.zIndex = ZIndex.Building;
        if (this.orientations == null) this.orientations = [AuthorizedOrientations.None];
        if (this.backColor == null) this.backColor = 0x000000;
        if (this.frontColor == null) this.frontColor = 0xFFFFFF;
        
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

  // TODO loaded database should be elsewhere
  public static loadedDatabase = false;
  public static oniItemsMap: Map<string, OniItem>;
  // TODO this instead of keys in sprite info, texture?
  public static get oniItems() { return Array.from(OniItem.oniItemsMap.values()); }
  public static init()
  {
    OniItem.oniItemsMap = new Map<string, OniItem>();
  }

  public static load(buildings: BBuilding[])
  {
    for (let building of buildings)
    {
      let oniItem = new OniItem(building.prefabId);
      oniItem.copyFrom(building);
      oniItem.cleanUp();

      // TODO spriteInfoId is not used anymore
      // TODO cleanup copyFrom and copyFromC
      
      // If the building is a tile, we need to generate its spriteInfos and sprite modifiers
      if (oniItem.isTile)
      {
        SpriteInfo.addSpriteInfoArray(DrawHelpers.generateTileSpriteInfo(building.kanimPrefix, building.textureName));
        SpriteModifier.addTileSpriteModifier(building.kanimPrefix);
      }
      

      SpriteModifier.AddSpriteModifier(building);
      
      OniItem.oniItemsMap.set(oniItem.id, oniItem);
    }
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

export enum Orientation
{
  Neutral,
  R90,
  R180,
  R270,
  NumRotations,
  FlipH,
  FlipV,
}