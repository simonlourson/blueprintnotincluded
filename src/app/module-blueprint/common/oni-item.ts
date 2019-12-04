import { Vector2 } from "./vector2";
import { UtilityConnection, ConnectionType, ConnectionHelper } from "./utility-connection";
import { ZIndex, Overlay } from "./overlay-type";
import { BlueprintParams } from "./params";
import { DrawHelpers, PermittedRotations } from "../drawing/draw-helpers";
import { BBuilding } from "./bexport/b-building";
import { ImageSource } from "../drawing/image-source";
import { SpriteInfo } from "../drawing/sprite-info";
import { SpriteModifier } from "../drawing/sprite-modifier";
import { BSpriteInfo } from './bexport/b-sprite-info';
import { BuildableElement } from './bexport/b-element';

export class OniItem
{
  static elementId = 'Element';
  static defaultColor = '#696969';

  id: string;
  name: string;

  // imageId here is used for some stuff (generating white background textures)
  imageId: string;
  iconUrl: string;
  spriteModifierId: string;
  isWire: boolean;
  isTile: boolean;
  isElement: boolean;
  size: Vector2;
  tileOffset: Vector2;
  utilityConnections: UtilityConnection[];
  backColor: number;
  frontColor: number;
  orientations: Orientation[];
  dragBuild: boolean;
  objectLayer: number; // TODO import enum?
  buildableElements: BuildableElement[];
  
  private permittedRotations_: PermittedRotations;
  get permittedRotations() { return this.permittedRotations_; }
  set permittedRotations(value: PermittedRotations) {
    this.permittedRotations_ = value;

    if (value == PermittedRotations.Unrotatable) this.orientations = [Orientation.Neutral];
    else if (value == PermittedRotations.FlipH) this.orientations = [Orientation.Neutral, Orientation.FlipH];
    else if (value == PermittedRotations.FlipV) this.orientations = [Orientation.Neutral, Orientation.FlipV];
    else if (value == PermittedRotations.R90) this.orientations = [Orientation.Neutral, Orientation.R90];
    else if (value == PermittedRotations.R360) this.orientations = [Orientation.Neutral, Orientation.R90, Orientation.R180, Orientation.R270];
  }

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
    this.name = original.name;
    this.size = original.sizeInCells;
    this.isWire = original.isUtility;
    this.isTile = original.isTile;

    this.spriteModifierId = original.kanimPrefix;
    this.iconUrl = DrawHelpers.createUrl(original.kanimPrefix + 'ui_0', true);
    this.zIndex = original.sceneLayer;
    this.overlay = this.getRealOverlay(original.viewMode);
    this.backColor = original.backColor;
    this.frontColor = original.frontColor;

    this.dragBuild = original.dragBuild;
    this.objectLayer = original.objectLayer;
    this.permittedRotations = original.permittedRotations;

    let imageId: string = original.textureName;
    let imageUrl: string = DrawHelpers.createUrl(imageId, false);
    ImageSource.AddImagePixi(imageId, imageUrl);

    this.buildableElements = BuildableElement.getElementsFromTags(original.materialCategory);

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

  public cleanUp()
  {
    if (this.isTile == null) this.isTile = false;
    if (this.isWire == null) this.isWire = false;
    if (this.isElement == null) this.isElement = false;
    if (this.size == null) this.size = new Vector2();
    if (this.utilityConnections == null) this.utilityConnections = [];
    if (this.zIndex == null) this.zIndex = ZIndex.Building;
    if (this.permittedRotations == null) this.permittedRotations = PermittedRotations.Unrotatable;
    if (this.backColor == null) this.backColor = 0x000000;
    if (this.frontColor == null) this.frontColor = 0xFFFFFF;
    if (this.buildableElements == null) this.buildableElements = [];
    
    if (Vector2.Zero.equals(this.size)) this.tileOffset = Vector2.Zero;
    else
    {
        this.tileOffset = new Vector2(
            1 - (this.size.x + (this.size.x % 2)) / 2,
            0
        );
    }

  }

  public static oniItemsMap: Map<string, OniItem>;
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

  public isOverlayPrimary(overlay: Overlay): boolean {
    return overlay == ConnectionHelper.getOverlayFromLayer(this.zIndex)
  }

  public isOverlaySecondary(overlay: Overlay): boolean {
    return overlay == this.overlay
  }

  public static getOniItem(id: string): OniItem
  {
    let returnValue = OniItem.oniItemsMap.get(id);
    /*
    if (returnValue == null) 
    {
      returnValue = new OniItem(id);
      returnValue.cleanUp();
    }
*/
    return returnValue;
  }
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